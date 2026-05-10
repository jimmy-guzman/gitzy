/**
 * Init command — generate a starter gitzy config file
 */

import type { Command } from "commander";

import { log } from "@clack/prompts";

import { init } from "@/core/init/init";

export const registerInitCommand = (program: Command) => {
  program
    .command("init")
    .description("Generate a starter .gitzyrc.json in the current directory")
    .option("-f, --force", "Overwrite existing config file")
    .action((opts: { force?: boolean }) => {
      try {
        const result = init(process.cwd(), { force: opts.force });

        if (result.exists && !opts.force) {
          log.warn(`Config file already exists: ${result.filePath}`);
        } else {
          log.success(`Created config file: ${result.filePath}`);
        }
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
