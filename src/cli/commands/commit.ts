/**
 * Commit command — interactive conventional commit flow
 */

import { log } from "@clack/prompts";
import type { Command } from "commander";
import { Option } from "commander";

import { createPrompts } from "@/cli/prompts/create-prompts";
import type { Answers, CommitFlags, GitzyState } from "@/cli/types";
import { readStdinJson } from "@/cli/utils/stdin";
import { defaultResolvedConfig } from "@/core/config/defaults";
import { resolveConfig } from "@/core/config/resolver";
import {
  formatMessage,
  formatMessageResult,
} from "@/core/conventional/message";
import { PartialMessagePartsSchema } from "@/core/conventional/schema";
import { defaultMessageParts } from "@/core/conventional/types";
import { getAmendParts } from "@/core/git/amend";
import {
  checkIfGitRepo,
  checkIfStaged,
  shouldDoGitChecks,
} from "@/core/git/checks";
import { commit } from "@/core/git/operations";
import { getSignoffTrailer } from "@/core/git/signoff";
import { isString } from "@/core/guards";
import { GitzyStore } from "@/core/store/store";
import { lang } from "@/lang";

const promptQuestions = async (
  state: GitzyState,
  flags: CommitFlags,
  autofillAnswers: Partial<Answers>,
  amendInitial?: Partial<Answers>
) => {
  if (
    flags.type !== undefined &&
    flags.type !== "" &&
    flags.subject !== undefined
  ) {
    const trimmedSubject = flags.subject.trim();
    const validType = state.config.types.some((t) => t.name === flags.type);

    if (!validType) {
      const allowed = state.config.types.map((t) => t.name).join(", ");

      throw new Error(
        `Invalid --type "${flags.type}". Allowed types: ${allowed}`
      );
    }

    if (trimmedSubject) {
      return {
        body: "",
        breaking: "",
        coAuthors: [],
        issues: [],
        scope: "",
        ...autofillAnswers,
        subject: trimmedSubject,
        type: flags.type,
      };
    }
  }

  return await createPrompts(state, flags, autofillAnswers, amendInitial);
};

const canSkipPrompts = (flags: CommitFlags) =>
  (flags.type !== undefined &&
    flags.type !== "" &&
    flags.subject !== undefined &&
    flags.subject !== "") ||
  flags.retry === true ||
  flags.stdin === true;

const toFlagAnswers = (flags: CommitFlags) => {
  const answers: Partial<Answers> = {};

  if (flags.body !== undefined) {
    answers.body = flags.body;
  }

  if (flags.breaking !== undefined) {
    answers.breaking = flags.breaking;
  }

  if (flags.coAuthor !== undefined) {
    answers.coAuthors = flags.coAuthor;
  }

  if (flags.issue !== undefined) {
    answers.issues = flags.issue;
  }

  if (flags.scope !== undefined) {
    answers.scope = flags.scope;
  }

  if (flags.signoff !== undefined) {
    answers.signoff = flags.signoff;
  }

  if (flags.subject !== undefined) {
    answers.subject = flags.subject;
  }

  if (flags.type !== undefined) {
    answers.type = flags.type;
  }

  return answers;
};

const loadAutofill = async (flags: CommitFlags, store: GitzyStore) => {
  const previous = flags.retry === true ? store.load() : {};

  if (flags.retry === true && Object.keys(previous).length === 0) {
    log.warn(`There is no previous gitzy commit to retry...`);
  }

  if (flags.stdin !== true) {
    return previous;
  }

  return { ...previous, ...(await readStdinJson(PartialMessagePartsSchema)) };
};

const writeMessage = async (state: GitzyState, flags: CommitFlags) => {
  const emojiEnabled = flags.noEmoji === true ? false : (flags.emoji ?? true);

  if (flags.json === true) {
    const result = formatMessageResult(
      state.config,
      state.answers,
      emojiEnabled
    );

    process.stdout.write(`${JSON.stringify(result)}\n`);

    return;
  }

  const message = formatMessage(state.config, state.answers, emojiEnabled);

  if (flags.dryRun === true) {
    log.info(`Message...`);
    log.message(`\n${message}\n`);

    return;
  }

  await commit(message, {
    amend: flags.amend,
    dryRun: flags.dryRun,
    hook: flags.hook,
    noVerify: flags.noVerify,
  });
};

export const registerCommitCommand = (program: Command) => {
  const noVerifyOption = new Option(
    "-n, --no-verify",
    lang.commit.flags.noVerify
  );

  noVerifyOption.negate = false;

  program
    .command("commit", { isDefault: true })
    .description(lang.commit.description)
    .option("--body <body>", lang.commit.flags.body)
    .option("--breaking [breaking]", lang.commit.flags.breaking)
    .option("-D, --dry-run", lang.commit.flags.dryRun)
    .option("--issue <issue...>", lang.commit.flags.issue)
    .option("--json", lang.commit.flags.json)
    .option("--no-emoji", lang.commit.flags.noEmoji)
    .option("--scope <scope>", lang.commit.flags.scope)
    .option("-m, --subject <subject>", lang.commit.flags.subject)
    .option("--type <type>", lang.commit.flags.type)
    .option("--retry", lang.commit.flags.retry)
    .option("--hook", lang.commit.flags.hook)
    .option("-a, --amend", lang.commit.flags.amend)
    .addOption(noVerifyOption)
    .option("-s, --signoff [signoff]", lang.commit.flags.signoff)
    .option("--co-author <coAuthor...>", lang.commit.flags.coAuthor)
    .option("--stdin", lang.commit.flags.stdin)
    .addHelpText("after", `\nExamples:\n      ${lang.commit.examples}\n    `)
    .action(async (opts: CommitFlags, command: Command) => {
      const store = new GitzyStore();

      const flags: CommitFlags = {
        ...opts,
        hook: process.env.GIT_DIR !== undefined || Boolean(opts.hook),
      };

      const state = {
        answers: defaultMessageParts,
        config: defaultResolvedConfig,
      };

      if (flags.dryRun === true) {
        log.info("Running in dry mode...");
      }

      try {
        state.config = await resolveConfig();

        if (
          isString(flags.breaking) &&
          flags.breaking &&
          state.config.breaking.format === "!"
        ) {
          log.warn(
            "--breaking message ignored when using '!' format. Use --breaking (without value) instead."
          );
        }

        if (
          shouldDoGitChecks({
            amend: flags.amend,
            dryRun: flags.dryRun,
            hook: flags.hook,
          })
        ) {
          await checkIfGitRepo();
          await checkIfStaged();
        }

        let amendInitial: Partial<Answers> | undefined;

        if (flags.amend === true) {
          amendInitial = await getAmendParts();
        }

        const autofillAnswers = await loadAutofill(flags, store);
        const flagAnswers = toFlagAnswers(flags);

        if (!process.stdin.isTTY && !canSkipPrompts(flags)) {
          command.error(
            "No TTY detected. Run gitzy commit --help for non-interactive usage."
          );
        }

        const answers = await promptQuestions(
          state,
          flags,
          { ...autofillAnswers, ...flagAnswers },
          amendInitial
        );

        store.save(answers);

        state.answers = { ...state.answers, ...answers };

        if (flags.coAuthor) {
          state.answers.coAuthors = flags.coAuthor;
        }

        if (
          flags.signoff !== undefined &&
          flags.signoff !== false &&
          flags.signoff !== ""
        ) {
          state.answers.signoff = flags.signoff;
        }

        if (state.answers.signoff === true) {
          state.answers.signoff = await getSignoffTrailer();
        }

        await writeMessage(state, flags);
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
