import { Command } from "commander";
import { version } from "package.json" with { type: "json" };

import { registerBranchCommand } from "@/cli/commands/branch";
import { registerCommitCommand } from "@/cli/commands/commit";
import { registerConfigCommand } from "@/cli/commands/config";
import { registerInitCommand } from "@/cli/commands/init";
import { registerSquashCommand } from "@/cli/commands/squash";
import { notice } from "@/cli/utils/log";
import { lang } from "@/lang";

export const cli = async () => {
  const program = new Command();

  program
    .configureOutput({
      outputError: (error) => {
        notice.error(error.replace("error: ", "").trim());
      },
      writeErr: (str) => {
        process.stderr.write(str.replace("error: ", ""));
      },
    })
    .version(version, "-v, --version")
    .description(lang.description)
    .name("gitzy");

  registerCommitCommand(program);
  registerBranchCommand(program);
  registerSquashCommand(program);
  registerInitCommand(program);
  registerConfigCommand(program);

  await program.parseAsync(process.argv);
};
