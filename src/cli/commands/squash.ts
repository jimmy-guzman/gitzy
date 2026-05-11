/**
 * Squash command — soft-reset last N commits and re-commit as one
 */

import type { Command } from "commander";

import { log } from "@clack/prompts";
import { Option } from "commander";

import type { Answers, GitzyState, SquashFlags } from "@/cli/types";

import { createPrompts } from "@/cli/prompts/create-prompts";
import { defaultResolvedConfig } from "@/core/config/defaults";
import { resolveConfig } from "@/core/config/resolver";
import {
  formatMessage,
  formatMessageResult,
} from "@/core/conventional/message";
import { defaultMessageParts } from "@/core/conventional/types";
import { getAmendParts } from "@/core/git/amend";
import { checkIfGitRepo } from "@/core/git/checks";
import { commit } from "@/core/git/operations";
import {
  getCommitsAheadCount,
  getDefaultBranch,
  softReset,
} from "@/core/git/squash";
import { lang } from "@/lang";

const promptQuestions = async (
  state: GitzyState,
  flags: SquashFlags,
  autofillAnswers: Partial<Answers>,
  amendInitial?: Partial<Answers>,
) => {
  if (flags.type && flags.subject) {
    const trimmedSubject = flags.subject.trim();
    const validType = state.config.types.some((t) => t.name === flags.type);

    if (!validType) {
      const allowed = state.config.types.map((t) => t.name).join(", ");

      throw new Error(
        `Invalid --type "${flags.type}". Allowed types: ${allowed}`,
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

  return createPrompts(state, flags, autofillAnswers, amendInitial);
};

const parseCount = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error("count must be a positive integer");
  }

  return parsed;
};

export const registerSquashCommand = (program: Command) => {
  const noVerifyOption = new Option(
    "-n, --no-verify",
    lang.squash.flags.noVerify,
  );

  noVerifyOption.negate = false;

  program
    .command("squash")
    .description(lang.squash.description)
    .option("--count <n>", lang.squash.flags.count, parseCount)
    .option("--body <body>", lang.squash.flags.body)
    .option("--breaking [breaking]", lang.squash.flags.breaking)
    .option("-D, --dry-run", lang.squash.flags.dryRun)
    .option("--issue <issue...>", lang.squash.flags.issue)
    .option("--json", lang.squash.flags.json)
    .option("--no-emoji", lang.squash.flags.noEmoji)
    .option("--scope <scope>", lang.squash.flags.scope)
    .option("-m, --subject <subject>", lang.squash.flags.subject)
    .option("--type <type>", lang.squash.flags.type)
    .addOption(noVerifyOption)
    .option("--co-author <coAuthor...>", lang.squash.flags.coAuthor)
    .option("--stdin", lang.squash.flags.stdin)
    .addHelpText("after", `\nExamples:\n      ${lang.squash.examples}\n    `)
    .action(async (opts: SquashFlags) => {
      const flags: SquashFlags = { ...opts };

      const state: GitzyState = {
        answers: defaultMessageParts,
        config: defaultResolvedConfig,
      };

      if (flags.dryRun) {
        log.info("running in dry mode...");
      }

      try {
        state.config = await resolveConfig();

        if (
          typeof flags.breaking === "string" &&
          flags.breaking &&
          state.config.breaking.format === "!"
        ) {
          log.warn(
            "--breaking message ignored when using '!' format. Use --breaking (without value) instead.",
          );
        }

        let { count } = flags;
        let base: string | undefined;

        if (count === undefined) {
          base = await getDefaultBranch();
          count = await getCommitsAheadCount(base);
        }

        if (count < 2) {
          const resolvedBase = base ?? (await getDefaultBranch());

          throw new Error(
            `Nothing to squash — only ${String(count)} ${count === 1 ? "commit" : "commits"} ahead of ${resolvedBase}`,
          );
        }

        if (!flags.dryRun) {
          await checkIfGitRepo();
        }

        const amendInitial = await getAmendParts();

        let autofillAnswers: Partial<Answers> = {};

        if (flags.stdin) {
          const raw = await new Promise<string>((resolve) => {
            let data = "";

            process.stdin.setEncoding("utf8");
            process.stdin.on("data", (chunk) => {
              data += String(chunk);
            });
            process.stdin.on("end", () => {
              resolve(data);
            });
          });

          try {
            autofillAnswers = {
              ...autofillAnswers,
              ...(JSON.parse(raw) as Partial<Answers>),
            };
          } catch {
            throw new Error("Invalid JSON provided to --stdin");
          }
        }

        const flagAnswers = {
          ...(flags.body === undefined ? {} : { body: flags.body }),
          ...(flags.breaking === undefined ? {} : { breaking: flags.breaking }),
          ...(flags.coAuthor === undefined
            ? {}
            : { coAuthors: flags.coAuthor }),
          ...(flags.issue === undefined ? {} : { issues: flags.issue }),
          ...(flags.scope === undefined ? {} : { scope: flags.scope }),
          ...(flags.subject === undefined ? {} : { subject: flags.subject }),
          ...(flags.type === undefined ? {} : { type: flags.type }),
        };

        const answers = await promptQuestions(
          state,
          flags,
          { ...autofillAnswers, ...flagAnswers },
          amendInitial,
        );

        state.answers = { ...state.answers, ...answers };

        const emojiEnabled =
          flags.noEmoji === true ? false : (flags.emoji ?? true);

        if (flags.json) {
          const result = formatMessageResult(
            state.config,
            state.answers,
            emojiEnabled,
          );

          process.stdout.write(`${JSON.stringify({ count, ...result })}\n`);
        } else {
          const message = formatMessage(
            state.config,
            state.answers,
            emojiEnabled,
          );

          if (flags.dryRun) {
            log.info(`Would squash ${String(count)} commits into:`);
            log.message(`\n${message}\n`);
          } else {
            await softReset(count);
            await commit(message, { noVerify: flags.noVerify });
          }
        }
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
