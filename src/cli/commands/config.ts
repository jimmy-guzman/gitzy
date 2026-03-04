/**
 * Config command — display the resolved gitzy configuration
 */

import type { Command } from "commander";

import { danger, log } from "@/cli/utils/logging";
import { resolveConfig } from "@/core/config/resolver";

export const registerConfigCommand = (program: Command) => {
  program
    .command("config")
    .description("display the resolved gitzy configuration")
    .option("--json", "output as JSON")
    .action(async (opts: { json?: boolean }) => {
      try {
        const config = await resolveConfig();

        if (opts.json) {
          process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
        } else {
          log(JSON.stringify(config, null, 2));
        }
      } catch (error: unknown) {
        log(
          `\n${danger(error instanceof Error ? error.message : String(error))}\n`,
        );
        process.exit(1);
      }
    });
};
