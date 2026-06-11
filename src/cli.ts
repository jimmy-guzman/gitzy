import { log } from "@clack/prompts";
import { Command } from "commander";
import { version } from "package.json" with { type: "json" };

import { registerBranchCommand } from "@/cli/commands/branch";
import { registerCommitCommand } from "@/cli/commands/commit";
import { registerConfigCommand } from "@/cli/commands/config";
import { registerInitCommand } from "@/cli/commands/init";
import { lang } from "@/lang";

export const cli = async () => {
  const program = new Command();

  program
    .configureOutput({
      outputError: (error) => {
        log.error(error.replace("error: ", "").trim());
      },
      writeErr: (str) => {
        return process.stdout.write(str.replace("error: ", ""));
      },
    })
    .version(version, "-v, --version")
    .description(lang.description)
    .name("gitzy");

  registerCommitCommand(program);
  registerBranchCommand(program);
  registerInitCommand(program);
  registerConfigCommand(program);

  await program.parseAsync(process.argv);
};
