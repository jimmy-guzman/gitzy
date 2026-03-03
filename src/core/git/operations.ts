/**
 * Core git operations - executing commits
 * This module is interface-agnostic and only knows about git commands
 */

import { writeFileSync } from "node:fs";
import path from "node:path";

import { x } from "tinyexec";

export interface CommitOptions {
  dryRun?: boolean;
  hook?: boolean;
  passthrough?: string[];
}

/**
 * Execute a git commit with the given message
 *
 * @param message - The full commit message string
 *
 * @param options - Commit options
 *
 * @param options.dryRun - Show message without committing
 *
 * @param options.hook - Run in git hook mode (writes to COMMIT_EDITMSG)
 *
 * @param options.passthrough - Additional git commit flags
 *
 * @returns Object with the message and whether it was committed
 */
export const commit = async (
  message: string,
  { dryRun = false, hook = false, passthrough = [] }: CommitOptions = {},
) => {
  if (dryRun) {
    return { committed: false, message };
  }

  if (hook) {
    const gitDir = process.env.GIT_DIR ?? ".git";
    const commitMsgPath = path.join(gitDir, "COMMIT_EDITMSG");

    writeFileSync(commitMsgPath, message);

    return { committed: true, message };
  }

  const result = await x("git", ["commit", "-m", message, ...passthrough], {
    nodeOptions: { stdio: "inherit" },
  });

  // This is restoring previous behavior where we exit the process on failure
  // https://github.com/jimmy-guzman/gitzy/blob/v6.1.0/src/utils/executeCommand.ts#L20-L24
  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }

  return { committed: true, message };
};
