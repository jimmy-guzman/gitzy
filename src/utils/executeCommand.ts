import { spawn } from "node:child_process";

import type { Flags, GitzyState } from "../interfaces";

import { formatCommitMessage } from "./format-message";
import { info, log } from "./logging";

/* istanbul ignore next */
export const executeCommand = (
  command: string,
  args: string[] = [],
  env = process.env,
): void => {
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

export const executeDryRun = (message: string): void => {
  log(info(`Message...`));
  log(`\n${message}\n`);
};

export const executeGitMessage = (
  { answers, config }: GitzyState,
  { dryRun = false, emoji = true, passthrough = [] }: Flags,
): void => {
  const message = formatCommitMessage(config, answers, emoji);

  if (dryRun) {
    executeDryRun(message);
  } else {
    executeCommand("git", ["commit", "-m", `"${message}"`, ...passthrough]);
  }
};
