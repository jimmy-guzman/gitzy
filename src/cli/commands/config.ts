/**
 * Config command — display the resolved gitzy configuration
 */

import type { Command } from "commander";

import { log } from "@clack/prompts";

import { resolveConfig } from "@/core/config/resolver";

export const registerConfigCommand = (program: Command) => {
  program
    .command("config")
    .description("display the resolved gitzy configuration")
    .action(async () => {
      try {
        const config = await resolveConfig();

        log.message(JSON.stringify(config, null, 2));
      } catch (error: unknown) {
        log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
};
