import { program } from "commander";
import { version } from "package.json" assert { type: "json" };

import { registerBranchCommand } from "./cli/commands/branch";
import { registerCommitCommand } from "./cli/commands/commit";
import { registerConfigCommand } from "./cli/commands/config";
import { registerInitCommand } from "./cli/commands/init";
import { danger } from "./cli/utils/logging";
import { lang } from "./lang";

export const cli = async () => {
  program
    .configureOutput({
      outputError: (error, write) => {
        write(`\n${danger(error)}\n`);
      },
      writeErr: (str) => process.stdout.write(str.replace("error: ", "")),
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
