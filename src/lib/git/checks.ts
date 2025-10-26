import { x } from "tinyexec";

import { hint } from "../logging";

/**
 * Determines whether or not files are staged.
 */

export const checkIfStaged = async () => {
  const result = await x("git", [
    "--no-pager",
    "diff",
    "--cached",
    "--quiet",
    "--exit-code",
  ]);

  if (result.exitCode === 0) {
    throw new Error(
      `No files staged \n${hint('You can use "gitzy -p -a" to replicate git -am')}`,
    );
  }

  if (result.exitCode === 1) {
    return "";
  }

  throw new Error("Failed to check staged files (git diff)");
};

/**
 * Determines whether or not it's a git repository.
 */
export const checkIfGitRepo = async () => {
  try {
    await x("git", ["rev-parse", "--is-inside-work-tree"], {
      throwOnError: true,
    });

    return "";
  } catch (error) {
    throw new Error(
      `Not a git repository \n${hint('You can try running "git init"')}`,
      { cause: error },
    );
  }
};

/**
 * Determines whether or not to perform git checks based on flags
 *
 * @param passthroughFlags flags
 */
export const shouldDoGitChecks = (
  passthroughFlags: string[] = [],
  cliFlags: { dryRun?: boolean; hook?: boolean } = {},
) => {
  if (cliFlags.dryRun || cliFlags.hook) {
    return false;
  }

  return !["--add", "-a", "--amend"].some((flag) => {
    return passthroughFlags.includes(flag);
  });
};
