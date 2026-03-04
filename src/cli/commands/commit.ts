/**
 * Commit command — interactive conventional commit flow
 */

import type { Command } from "commander";

import { styleText } from "node:util";

import Enquirer from "enquirer";

import type { Answers, CommitFlags, GitzyState } from "@/cli/types";

import { createPrompts } from "@/cli/prompts/create-prompts";
import { danger, hint, info, log, warn } from "@/cli/utils/logging";
import { defaultResolvedConfig } from "@/core/config/defaults";
import { resolveConfig } from "@/core/config/resolver";
import {
  formatMessage,
  formatMessageResult,
} from "@/core/conventional/message";
import { defaultMessageParts } from "@/core/conventional/types";
import { getAmendParts } from "@/core/git/amend";
import {
  checkIfGitRepo,
  checkIfStaged,
  shouldDoGitChecks,
} from "@/core/git/checks";
import { commit } from "@/core/git/operations";
import { GitzyStore } from "@/core/store/store";
import { lang } from "@/lang";

const promptQuestions = async (
  state: GitzyState,
  flags: CommitFlags,
  autofillAnswers: Partial<Answers>,
  amendInitial?: Partial<Answers>,
): Promise<Answers> => {
  if (flags.type && flags.subject) {
    return {
      body: flags.body ?? "",
      breaking: typeof flags.breaking === "string" ? flags.breaking : "",
      coAuthors: flags.coAuthor ?? [],
      issues: flags.issue ?? [],
      scope: flags.scope ?? "",
      subject: flags.subject,
      type: flags.type,
    };
  }

  const enquirer = new Enquirer(
    {
      autofill: true,
      cancel: () => null,
      styles: {
        danger: (value: string) => styleText("red", value),
        submitted: (value: string) => styleText("cyan", value),
      },
    },
    { emoji: flags.emoji ?? true, hook: flags.hook, ...autofillAnswers },
  );
  const prompts = createPrompts(state, flags, amendInitial);

  return enquirer.prompt(
    prompts as Parameters<typeof enquirer.prompt>[0],
  ) as Promise<Answers>;
};

export const registerCommitCommand = (program: Command) => {
  program
    .command("commit", { isDefault: true })
    .description(lang.commit.description)
    .option("-d, --body <body>", lang.commit.flags.body)
    .option("-b, --breaking [breaking]", lang.commit.flags.breaking)
    .option("-D, --dry-run", lang.commit.flags.dryRun)
    .option("-i, --issue <issue...>", lang.commit.flags.issue)
    .option("-j, --json", lang.commit.flags.json)
    .option("--no-emoji", lang.commit.flags.noEmoji)
    .option("-s, --scope <scope>", lang.commit.flags.scope)
    .option("-m, --subject <message>", lang.commit.flags.subject)
    .option("-t, --type <type>", lang.commit.flags.type)
    .option("-r, --retry", lang.commit.flags.retry)
    .option("-H, --hook", "enable running inside a git hook (e.g. pre-commit)")
    .option("-a, --amend", lang.commit.flags.amend)
    .option("-n, --no-verify", lang.commit.flags.noVerify)
    .option("-c, --co-author <coAuthor...>", lang.commit.flags.coAuthor)
    .option("--stdin", "read answers from stdin as JSON")
    .addHelpText("after", `\nExamples:\n      ${lang.commit.examples}\n    `)
    .action(async (opts: CommitFlags) => {
      const store = new GitzyStore<Answers>();

      const flags: CommitFlags = {
        ...opts,
        hook: process.env.GIT_DIR !== undefined || Boolean(opts.hook),
      };

      const state: GitzyState = {
        answers: defaultMessageParts,
        config: defaultResolvedConfig,
      };

      if (flags.dryRun) {
        log(info("running in dry mode..."));
      }

      if (
        typeof flags.breaking === "string" &&
        flags.breaking &&
        state.config.breaking.format === "!"
      ) {
        log(
          warn(
            "--breaking message ignored when using '!' format. Use --breaking (without value) instead.",
          ),
        );
      }

      try {
        state.config = await resolveConfig();

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

        if (flags.amend) {
          amendInitial = await getAmendParts();
        }

        let autofillAnswers: Partial<Answers> = {};

        if (flags.retry) {
          const previousAnswers = store.load();

          if (Object.keys(previousAnswers).length === 0) {
            log(hint(`there is no previous gitzy commit to retry...`));
          }

          autofillAnswers = { ...autofillAnswers, ...previousAnswers };
        }

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

        const answers = await promptQuestions(
          state,
          flags,
          {
            ...autofillAnswers,
            ...(flags as Partial<Answers>),
            ...(flags.issue === undefined ? {} : { issues: flags.issue }),
          },
          amendInitial,
        );

        store.save(answers);

        state.answers = { ...state.answers, ...answers };

        if (flags.coAuthor) {
          state.answers.coAuthors = flags.coAuthor;
        }

        const emojiEnabled =
          flags.noEmoji === true ? false : (flags.emoji ?? true);

        if (flags.json) {
          const result = formatMessageResult(
            state.config,
            state.answers,
            emojiEnabled,
          );

          process.stdout.write(`${JSON.stringify(result)}\n`);
        } else {
          const message = formatMessage(
            state.config,
            state.answers,
            emojiEnabled,
          );

          if (flags.dryRun) {
            log(info(`Message...`));
            log(`\n${message}\n`);
          } else {
            await commit(message, {
              amend: flags.amend,
              dryRun: flags.dryRun,
              hook: flags.hook,
              noVerify: flags.noVerify,
            });
          }
        }
      } catch (error: unknown) {
        log(
          `\n${danger(error instanceof Error ? error.message : String(error))}\n`,
        );
        process.exit(1);
      }
    });
};
