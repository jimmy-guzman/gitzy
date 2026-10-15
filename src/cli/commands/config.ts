/**
 * Config command — display the resolved gitzy configuration
 */

import type { Command } from "commander";

import { resolveConfigWithWarnings } from "@/cli/utils/config";
import { notice } from "@/cli/utils/log";

export const registerConfigCommand = (program: Command) => {
  program
    .command("config")
    .description("Display the resolved gitzy configuration")
    .action(async () => {
      try {
        const config = await resolveConfigWithWarnings();

        process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
      } catch (error: unknown) {
        notice.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
