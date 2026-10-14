/**
 * Commit command — interactive conventional commit flow
 */

import { log } from "@clack/prompts";
import type { Command } from "commander";
import { Option } from "commander";

import { createPrompts } from "@/cli/prompts/create-prompts";
import type { CommitFlags } from "@/cli/types";
import { readStdinJson } from "@/cli/utils/stdin";
import { resolveConfig } from "@/core/config/resolver";
import type { ResolvedConfig } from "@/core/config/types";
import { formatMessageResult } from "@/core/conventional/message";
import { PartialMessagePartsSchema } from "@/core/conventional/schema";
import type { MessageParts } from "@/core/conventional/types";
import { getAmendParts } from "@/core/git/amend";
import { checkIfGitRepo, checkIfStaged } from "@/core/git/checks";
import { commit } from "@/core/git/operations";
import { getSignoffTrailer } from "@/core/git/signoff";
import { isString } from "@/core/guards";
import { loadAnswers, saveAnswers } from "@/core/store/store";
import { lang } from "@/lang";

const promptQuestions = async (
  config: ResolvedConfig,
  flags: CommitFlags,
  autofillAnswers: Partial<MessageParts>,
  amendInitial?: Partial<MessageParts>
) => {
  if (
    flags.type !== undefined &&
    flags.type !== "" &&
    flags.subject !== undefined
  ) {
    const trimmedSubject = flags.subject.trim();
    const validType = config.types.some((t) => t.name === flags.type);

    if (!validType) {
      const allowed = config.types.map((t) => t.name).join(", ");

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

  return await createPrompts(config, flags, autofillAnswers, amendInitial);
};

const canSkipPrompts = (flags: CommitFlags) =>
  (flags.type !== undefined &&
    flags.type !== "" &&
    flags.subject !== undefined &&
    flags.subject !== "") ||
  flags.retry === true ||
  flags.stdin === true;

const toFlagAnswers = (flags: CommitFlags) => {
  const answers: Partial<MessageParts> = {};

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

const loadAutofill = async (flags: CommitFlags) => {
  const previous = flags.retry === true ? loadAnswers() : {};

  if (flags.retry === true && Object.keys(previous).length === 0) {
    log.warn(`There is no previous gitzy commit to retry...`);
  }

  if (flags.stdin !== true) {
    return previous;
  }

  return { ...previous, ...(await readStdinJson(PartialMessagePartsSchema)) };
};

const writeMessage = async (
  config: ResolvedConfig,
  answers: MessageParts,
  flags: CommitFlags,
  hookInferredFrom: string | undefined
) => {
  const formatted = formatMessageResult(config, answers, flags.emoji ?? true);

  if (flags.json === true) {
    process.stdout.write(`${JSON.stringify(formatted)}\n`);

    return;
  }

  const { message } = formatted;

  if (flags.dryRun === true) {
    log.info(`Message...`);
    log.message(`\n${message}\n`);

    return;
  }

  const result = await commit(message, {
    amend: flags.amend,
    hook: flags.hook,
    noVerify: flags.noVerify,
  });

  if (hookInferredFrom !== undefined && "commitMsgPath" in result) {
    log.warn(
      `Inferred hook mode from ${hookInferredFrom}: wrote ${result.commitMsgPath} instead of running git commit. Pass --hook to make this explicit.`,
      { output: process.stderr }
    );
  }
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
      const hookInferredFrom =
        opts.hook === true
          ? undefined
          : ["GIT_DIR", "GIT_INDEX_FILE"].find(
              (name) => process.env[name] !== undefined
            );

      const flags: CommitFlags = {
        ...opts,
        hook: hookInferredFrom !== undefined || Boolean(opts.hook),
      };

      if (flags.dryRun === true) {
        log.info("Running in dry mode...");
      }

      try {
        const config = await resolveConfig();

        if (
          isString(flags.breaking) &&
          flags.breaking &&
          config.breaking.format === "!"
        ) {
          log.warn(
            "--breaking message ignored when using '!' format. Use --breaking (without value) instead."
          );
        }

        if (
          flags.dryRun !== true &&
          flags.hook !== true &&
          flags.amend !== true
        ) {
          await checkIfGitRepo();
          await checkIfStaged();
        }

        const amendInitial =
          flags.amend === true ? await getAmendParts() : undefined;
        const autofillAnswers = await loadAutofill(flags);
        const flagAnswers = toFlagAnswers(flags);

        if (!process.stdin.isTTY && !canSkipPrompts(flags)) {
          command.error(
            "No TTY detected. Run gitzy commit --help for non-interactive usage."
          );
        }

        const answers: MessageParts = await promptQuestions(
          config,
          flags,
          { ...autofillAnswers, ...flagAnswers },
          amendInitial
        );

        saveAnswers(answers);

        if (flags.coAuthor) {
          answers.coAuthors = flags.coAuthor;
        }

        if (
          flags.signoff !== undefined &&
          flags.signoff !== false &&
          flags.signoff !== ""
        ) {
          answers.signoff = flags.signoff;
        }

        if (answers.signoff === true) {
          answers.signoff = await getSignoffTrailer();
        }

        await writeMessage(config, answers, flags, hookInferredFrom);
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
