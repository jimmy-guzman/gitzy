/**
 * Init command — generate a starter gitzy config file
 */

import type { Command } from "commander";

import { danger, info, log, warn } from "@/cli/utils/logging";
import { init } from "@/core/init/init";

export const registerInitCommand = (program: Command) => {
  program
    .command("init")
    .description("generate a starter .gitzyrc.json in the current directory")
    .option("-f, --force", "overwrite existing config file")
    .action((opts: { force?: boolean }) => {
      try {
        const result = init(process.cwd(), { force: opts.force });

        if (result.exists && !opts.force) {
          log(warn(`Config file already exists: ${result.filePath}`));
        } else {
          log(info(`Created config file: ${result.filePath}`));
        }
      } catch (error: unknown) {
        log(
          `\n${danger(error instanceof Error ? error.message : String(error))}\n`,
        );
        process.exit(1);
      }
    });
};
