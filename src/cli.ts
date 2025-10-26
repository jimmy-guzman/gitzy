import { styleText } from "node:util";

import type { CommanderError } from "commander";

import { program } from "commander";
import Enquirer from "enquirer";
import { version } from "package.json" assert { type: "json" };

import type { Answers, Flags, GitzyConfig } from "./interfaces";

import { options } from "./cli/options";
import { loadUserConfig } from "./config/loaders/user";
import { defaultAnswers } from "./defaults/answers";
import { defaultConfig } from "./defaults/config";
import { lang } from "./lang";
import {
  checkIfGitRepo,
  checkIfStaged,
  shouldDoGitChecks,
} from "./lib/git/checks";
import { performCommit } from "./lib/git/commits";
import { danger, hint, info, log, warn } from "./lib/logging";
import { createPrompts } from "./prompts/create-prompts";
import { GitzyStore } from "./store/gitzy";

const enquirerOptions = {
  autofill: true,
  cancel: (): null => {
    return null;
  },
  styles: {
    danger: (value: string) => {
      return styleText("red", value);
    },
    submitted: (value: string) => {
      return styleText("cyan", value);
    },
  },
};

export const cli = async () => {
  const state: { answers: Answers; config: GitzyConfig } = {
    answers: defaultAnswers,
    config: defaultConfig,
  };
  const store = new GitzyStore<Answers>();

  const init = async ({ commitlint, dryRun, hook, passthrough }: Flags) => {
    const loadedUserConfig = await loadUserConfig(commitlint);

    if (loadedUserConfig) {
      state.config = { ...state.config, ...loadedUserConfig };
    }

    if (shouldDoGitChecks(passthrough, { dryRun, hook })) {
      await checkIfGitRepo();
      await checkIfStaged();
    }
  };

  const promptQuestions = async (flags: Answers) => {
    const enquirer = new Enquirer(enquirerOptions, flags);
    const prompts = createPrompts(state, flags);

    return enquirer.prompt(prompts);
  };

  program
    .configureOutput({
      outputError: (error, write) => {
        write(`\n${danger(error)}\n`);
      },
      writeErr: (str) => {
        return process.stdout.write(str.replace("error: ", ""));
      },
    })
    .version(version, "-v, --version")
    .description(lang.description)
    .option("-d, --body <body>", lang.flags.body)
    .option(
      "-b, --breaking [breaking]",
      lang.flags.breaking,
      (value: string | undefined) => {
        return value ?? true;
      },
    )
    .option("-D, --dry-run", lang.flags.dryRun)
    .option("-i, --issues <body>", lang.flags.issues)
    .option("-p, --passthrough <flags...>", lang.flags.passthrough)
    .option("-s, --scope <scope>", lang.flags.scope)
    .option("-m, --subject <message>", lang.flags.subject)
    .option("-t, --type <type>", lang.flags.type)
    .option("-l, --commitlint", lang.flags.commitlint)
    .option("-r, --retry", lang.flags.retry)
    .option("--no-emoji", lang.flags.noEmoji)
    .option("-H, --hook", lang.flags.hook)

    .addOption(options.skip)
    .addHelpText(
      "after",
      `
Examples:
      ${lang.examples}
    `,
    )
    .name("gitzy")

    .action(async () => {
      const opts = program.opts<Flags>();
      const flags = {
        ...opts,
        hook: process.env.GIT_DIR !== undefined || opts.hook,
      };

      if (flags.dryRun) {
        log(info("running in dry mode..."));
      }

      if (
        typeof flags.breaking === "string" &&
        flags.breaking &&
        state.config.breakingChangeFormat === "!"
      ) {
        log(
          warn(
            "--breaking message ignored when using '!' format. Use --breaking (without value) instead.",
          ),
        );
      }

      try {
        await init(flags);
        const previousAnswers = flags.retry ? store.load() : {};

        if (flags.retry && Object.keys(previousAnswers).length === 0) {
          log(hint(`there is no previous gitzy commit to retry...`));
        }

        const answers = await promptQuestions({
          ...(flags as Answers),
          ...previousAnswers,
        });

        store.save(answers);

        state.answers = { ...state.answers, ...answers };
      } catch (error: unknown) {
        log(`\n${danger((error as CommanderError).message)}\n`);

        process.exit(1);
      }

      await performCommit(state, flags);
    });

  await program.parseAsync(process.argv);
};
