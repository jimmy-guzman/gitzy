import { writeFileSync } from "node:fs";

import { x } from "tinyexec";

import type { Flags, GitzyState } from "@/interfaces";

import { info, log } from "../logging";
import { formatMessage } from "./messages";

export const performCommit = async (
  { answers, config }: GitzyState,
  { dryRun = false, emoji = true, hook = false, passthrough = [] }: Flags,
) => {
  const message = formatMessage(config, answers, emoji);

  if (dryRun) {
    log(info(`Message...`));
    log(`\n${message}\n`);

    return;
  }

  if (hook) {
    writeFileSync(".git/COMMIT_EDITMSG", message);
  } else {
    const result = await x("git", ["commit", "-m", message, ...passthrough], {
      nodeOptions: { stdio: "inherit" },
    });

    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  }
};
