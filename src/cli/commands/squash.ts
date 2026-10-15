/**
 * Squash command — soft-reset the last N commits and re-commit them as one
 */

import { log } from "@clack/prompts";
import type { Command } from "commander";
import { InvalidArgumentError } from "commander";

import { addMessageOptions, collectAnswers } from "@/cli/commands/commit";
import type { SquashFlags } from "@/cli/types";
import { resolveConfigWithWarnings } from "@/cli/utils/config";
import { notice } from "@/cli/utils/log";
import { formatMessageResult } from "@/core/conventional/message";
import { getAmendParts } from "@/core/git/amend";
import { checkIfGitRepo, checkIfNothingStaged } from "@/core/git/checks";
import { commit } from "@/core/git/operations";
import {
  checkCanSquash,
  countCommitsAhead,
  getDefaultBranch,
  softReset,
} from "@/core/git/squash";
import { lang } from "@/lang";

const parseCount = (value: string) => {
  const count = Number(value);

  if (!Number.isInteger(count) || count < 2) {
    throw new InvalidArgumentError("Must be an integer of at least 2.");
  }

  return count;
};

const resolveCount = async (flags: SquashFlags) => {
  if (flags.count !== undefined) {
    return flags.count;
  }

  const base = await getDefaultBranch();
  const count = await countCommitsAhead(base);

  if (count < 2) {
    throw new Error(`Nothing to squash: ${count} commit(s) ahead of ${base}`);
  }

  return count;
};

export const registerSquashCommand = (program: Command) => {
  addMessageOptions(
    program
      .command("squash")
      .description(lang.squash.description)
      .option("--count <n>", lang.squash.flags.count, parseCount),
    lang.squash.flags.dryRun
  )
    .addHelpText("after", `\nExamples:\n      ${lang.squash.examples}\n    `)
    .action(async (flags: SquashFlags, command: Command) => {
      if (flags.dryRun === true) {
        notice.info("Running in dry mode...");
      }

      try {
        const config = await resolveConfigWithWarnings();

        await checkIfGitRepo();

        const count = await resolveCount(flags);

        await checkCanSquash(count);

        if (flags.dryRun !== true && flags.json !== true) {
          await checkIfNothingStaged();
        }

        const answers = await collectAnswers(
          config,
          flags,
          command,
          await getAmendParts()
        );
        const result = formatMessageResult(
          config,
          answers,
          flags.emoji ?? true
        );

        if (flags.json === true) {
          process.stdout.write(`${JSON.stringify({ count, ...result })}\n`);

          return;
        }

        if (flags.dryRun === true) {
          log.info(`Would squash ${count} commits into...`);
          log.message(`\n${result.message}\n`);

          return;
        }

        notice.info(
          `Squashing ${count} commits (undo with "git reset --soft ORIG_HEAD")`
        );
        await softReset(count);
        await commit(result.message, { noVerify: flags.noVerify });
      } catch (error: unknown) {
        notice.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
