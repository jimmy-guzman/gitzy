/**
 * Core git operations - executing commits
 * This module is interface-agnostic and only knows about git commands
 */

import { writeFileSync } from "node:fs";
import path from "node:path";

import { x } from "tinyexec";

/**
 * Get the absolute path of the git directory, wherever in the work tree we are
 */
export const getGitDir = async () => {
  try {
    const result = await x("git", ["rev-parse", "--absolute-git-dir"], {
      throwOnError: true,
    });

    return result.stdout.trim();
  } catch (error) {
    throw new Error('Not a git repository \nYou can try running "git init"', {
      cause: error,
    });
  }
};

/**
 * Execute a git commit with the given message
 *
 * @param message - The full commit message string
 *
 * @param options - Commit options
 *
 * @param options.amend - Amend the previous commit
 *
 * @param options.hook - Run in git hook mode (writes to COMMIT_EDITMSG)
 *
 * @param options.noVerify - Skip git hooks (--no-verify)
 *
 * @returns Object with the message and, in hook mode, the COMMIT_EDITMSG path
 */
export const commit = async (
  message: string,
  {
    amend = false,
    hook = false,
    noVerify = false,
  }: { amend?: boolean; hook?: boolean; noVerify?: boolean } = {}
) => {
  if (hook) {
    const gitDir = process.env.GIT_DIR ?? (await getGitDir());
    const commitMsgPath = path.join(gitDir, "COMMIT_EDITMSG");

    writeFileSync(commitMsgPath, message);

    return { commitMsgPath, message };
  }

  const result = await x(
    "git",
    [
      "commit",
      "-m",
      message,
      ...(amend ? ["--amend"] : []),
      ...(noVerify ? ["--no-verify"] : []),
    ],
    { nodeOptions: { stdio: "inherit" } }
  );

  // This is restoring previous behavior where we exit the process on failure
  // https://github.com/jimmy-guzman/gitzy/blob/v6.1.0/src/utils/executeCommand.ts#L20-L24
  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }

  return { message };
};
