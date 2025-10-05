import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

import type { Flags, GitzyState } from "../interfaces";

import { formatCommitMessage } from "./format-message";
import { info, log } from "./logging";

export const executeCommand = (
  command: string,
  args: string[] = [],
  env = process.env,
) => {
  const proc = spawn(command, args, {
    env,
    shell: true,
    stdio: [0, 1, 2],
  });

  proc.on("close", (code) => {
    if (code) {
      process.exit(code);
    }
  });
};

export const executeDryRun = (message: string) => {
  log(info(`Message...`));
  log(`\n${message}\n`);
};

export const executeGitMessage = (
  { answers, config }: GitzyState,
  { dryRun = false, emoji = true, hook = false, passthrough = [] }: Flags,
) => {
  const message = formatCommitMessage(config, answers, emoji, hook);

  if (dryRun) {
    executeDryRun(message);

    return;
  }

  if (hook) {
    writeFileSync(".git/COMMIT_EDITMSG", message);
  } else {
    executeCommand("git", ["commit", "-m", `"${message}"`, ...passthrough]);
  }
};
