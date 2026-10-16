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
import { defaultMessageParts } from "@/core/conventional/types";
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
  const hasTypeAndSubject =
    flags.type !== undefined &&
    flags.type !== "" &&
    (flags.subject?.trim() ?? "") !== "";
  const parts =
    hasTypeAndSubject || flags.stdin === true || !process.stdin.isTTY
      ? {
          ...defaultMessageParts,
          coAuthors: amendInitial?.coAuthors ?? defaultMessageParts.coAuthors,
          signoff: amendInitial?.signoff,
          ...autofillAnswers,
          subject: (autofillAnswers.subject ?? "").trim(),
        }
      : await createPrompts(config, flags, autofillAnswers, amendInitial);

  return assertValid(config, parts, flags.emoji ?? true);
};

const toFlagAnswers = (flags: CommitFlags) => ({
  ...(flags.body !== undefined && { body: flags.body }),
  ...(flags.breaking !== undefined && { breaking: flags.breaking }),
  ...(flags.coAuthor !== undefined && { coAuthors: flags.coAuthor }),
  ...(flags.issue !== undefined && { issues: flags.issue }),
  ...(flags.scope !== undefined && { scope: flags.scope }),
  ...(flags.signoff !== undefined && { signoff: flags.signoff }),
  ...(flags.subject !== undefined && { subject: flags.subject }),
  ...(flags.type !== undefined && { type: flags.type }),
});

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

/**
 * Resolve the commit answers from flags, stdin, retry store and prompts
 */
export const collectAnswers = async (
  config: ResolvedConfig,
  flags: CommitFlags,
  command: Command,
  initial?: Partial<MessageParts>
) => {
  if (
    isString(flags.breaking) &&
    flags.breaking &&
    config.breaking.format === "!"
  ) {
    notice.warn(
      "--breaking message ignored when using '!' format. Use --breaking (without value) instead."
    );
  }

  const retryFile = await storePath();
  const autofillAnswers = await loadAutofill(flags, retryFile);
  const flagAnswers = toFlagAnswers(flags);

  if (!process.stdin.isTTY && !canSkipPrompts(flags)) {
    command.error(
      `No TTY detected. Run gitzy ${command.name()} --help for non-interactive usage.`
    );
  }

  const answers: MessageParts = await promptQuestions(
    config,
    flags,
    { ...autofillAnswers, ...flagAnswers },
    initial
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

  return answers;
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

/**
 * Add the message flags shared by `commit` and `squash`
 */
export const addMessageOptions = (command: Command, dryRun: string) => {
  const noVerifyOption = new Option(
    "-n, --no-verify",
    lang.commit.flags.noVerify
  );

  noVerifyOption.negate = false;

  return command
    .option("--body <body>", lang.commit.flags.body)
    .option("--breaking [breaking]", lang.commit.flags.breaking)
    .option("-D, --dry-run", dryRun)
    .option("--issue <issue...>", lang.commit.flags.issue)
    .option("--json", lang.commit.flags.json)
    .option("--no-emoji", lang.commit.flags.noEmoji)
    .option("--scope <scope>", lang.commit.flags.scope)
    .option("-m, --subject <subject>", lang.commit.flags.subject)
    .option("--type <type>", lang.commit.flags.type)
    .addOption(noVerifyOption)
    .option("--co-author <coAuthor...>", lang.commit.flags.coAuthor)
    .option("--stdin", lang.commit.flags.stdin);
};

export const registerCommitCommand = (program: Command) => {
  addMessageOptions(
    program
      .command("commit", { isDefault: true })
      .description(lang.commit.description),
    lang.commit.flags.dryRun
  )
    .option("--retry", lang.commit.flags.retry)
    .option("--hook", lang.commit.flags.hook)
    .option("-a, --amend", lang.commit.flags.amend)
    .option("-s, --signoff [signoff]", lang.commit.flags.signoff)
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
          flags.dryRun !== true &&
          flags.hook !== true &&
          flags.amend !== true
        ) {
          await checkIfGitRepo();
          await checkIfStaged();
        }

        const answers = await collectAnswers(
          config,
          flags,
          command,
          flags.amend === true ? await getAmendParts() : undefined
        );

        await writeMessage(config, answers, flags, hookInferredFrom);
      } catch (error: unknown) {
        notice.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
