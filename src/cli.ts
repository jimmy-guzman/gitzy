import { styleText } from "node:util";

import type { CommanderError } from "commander";

import { program } from "commander";
import Enquirer from "enquirer";

import type { Answers, Flags } from "./interfaces";

// eslint-disable-next-line import-x/extensions -- TODO: refactor
import { version } from "../package.json" assert { type: "json" };
import { options } from "./cli/options";
import { getUserConfig } from "./config";
import { defaultAnswers, defaultConfig } from "./defaults";
import { lang } from "./lang";
import { createPrompts } from "./prompts";
import {
  checkIfGitRepo,
  checkIfStaged,
  danger,
  executeGitMessage,
  GitzyStore,
  hint,
  info,
  log,
  shouldDoGitChecks,
} from "./utils";

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
  const state = { answers: defaultAnswers, config: defaultConfig };
  const store = new GitzyStore<Answers>();

  const init = async ({ commitlint, dryRun, passthrough }: Flags) => {
    const loadedUserConfig = await getUserConfig(commitlint);

    if (loadedUserConfig) {
      state.config = { ...state.config, ...loadedUserConfig };
    }

    if (shouldDoGitChecks(passthrough) && !dryRun) {
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
    .option("-b, --breaking <breaking>", lang.flags.breaking)
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

      executeGitMessage(state, flags);
    });

  await program.parseAsync(process.argv);
};
