/**
 * Commit command — interactive conventional commit flow
 */

import { log } from "@clack/prompts";
import type { Command } from "commander";
import { Option } from "commander";

import { createPrompts } from "@/cli/prompts/create-prompts";
import type { CommitFlags } from "@/cli/types";
import { resolveConfigWithWarnings } from "@/cli/utils/config";
import { notice } from "@/cli/utils/log";
import { readStdinJson } from "@/cli/utils/stdin";
import type { ResolvedConfig } from "@/core/config/types";
import { formatMessageResult } from "@/core/conventional/message";
import { PartialMessagePartsSchema } from "@/core/conventional/schema";
import type { MessageParts } from "@/core/conventional/types";
import { validateMessageParts } from "@/core/conventional/validate";
import { getAmendParts } from "@/core/git/amend";
import { checkIfGitRepo, checkIfStaged } from "@/core/git/checks";
import { commit } from "@/core/git/operations";
import { getSignoffTrailer } from "@/core/git/signoff";
import { isString } from "@/core/guards";
import { loadAnswers, saveAnswers, storePath } from "@/core/store/store";
import { lang } from "@/lang";

const assertValid = (
  config: ResolvedConfig,
  parts: MessageParts,
  emoji: boolean
) => {
  const problems = validateMessageParts(config, parts, emoji);

  if (problems.length > 0) {
    throw new TypeError(problems.join("\n"));
  }

  return parts;
};

const canSkipPrompts = (flags: CommitFlags) =>
  (flags.type !== undefined &&
    flags.type !== "" &&
    flags.subject !== undefined &&
    flags.subject !== "") ||
  flags.retry === true ||
  flags.stdin === true;

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

    if (trimmedSubject) {
      return assertValid(
        config,
        {
          body: "",
          breaking: "",
          coAuthors: [],
          issues: [],
          scope: "",
          ...autofillAnswers,
          subject: trimmedSubject,
          type: flags.type,
        },
        flags.emoji ?? true
      );
    }
  }

  // --stdin always answers from JSON, and a missing TTY can't prompt at all
  // (e.g. --retry with nothing stored) — build the answers directly and let
  // the shared validator report every problem at once instead of hanging on
  // a prompt that has no terminal to render into.
  if (flags.stdin === true || !process.stdin.isTTY) {
    return assertValid(
      config,
      {
        body: "",
        breaking: "",
        coAuthors: [],
        issues: [],
        scope: "",
        type: "",
        ...autofillAnswers,
        subject: (autofillAnswers.subject ?? "").trim(),
      },
      flags.emoji ?? true
    );
  }

  return assertValid(
    config,
    await createPrompts(config, flags, autofillAnswers, amendInitial),
    flags.emoji ?? true
  );
};

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

const loadAutofill = async (flags: CommitFlags, retryFile: string) => {
  const previous = flags.retry === true ? loadAnswers(retryFile) : {};

  if (flags.retry === true && Object.keys(previous).length === 0) {
    notice.warn(`There is no previous gitzy commit to retry...`);
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
    notice.warn(
      `Inferred hook mode from ${hookInferredFrom}: wrote ${result.commitMsgPath} instead of running git commit. Pass --hook to make this explicit.`
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
        notice.info("Running in dry mode...");
      }

      try {
        const config = await resolveConfigWithWarnings();

        if (
          isString(flags.breaking) &&
          flags.breaking &&
          config.breaking.format === "!"
        ) {
          notice.warn(
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
        const retryFile = await storePath();
        const autofillAnswers = await loadAutofill(flags, retryFile);
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

        saveAnswers(retryFile, answers);

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
        notice.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
