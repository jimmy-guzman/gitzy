/**
 * Git squash operations — count and soft-reset commits
 */

import { x } from "tinyexec";

/**
 * Get the remote default branch (e.g. "origin/main"), falling back to "origin/main"
 */
export const getDefaultBranch = async () => {
  const result = await x("git", [
    "symbolic-ref",
    "--short",
    "refs/remotes/origin/HEAD",
  ]);

  return result.exitCode === 0 ? result.stdout.trim() : "origin/main";
};

/**
 * Count how many commits HEAD is ahead of a base ref
 */
export const countCommitsAhead = async (base: string) => {
  try {
    const result = await x(
      "git",
      ["rev-list", "--first-parent", "--count", "HEAD", `^${base}`],
      {
        throwOnError: true,
      }
    );

    return Number(result.stdout.trim());
  } catch (error) {
    throw new Error(
      `Unable to determine commits ahead of ${base}. Use --count to set it.`,
      { cause: error }
    );
  }
};

/**
 * Ensure HEAD has `count` commits with a parent to reset onto
 */
export const checkCanSquash = async (count: number) => {
  const result = await x("git", [
    "rev-parse",
    "--verify",
    "--quiet",
    `HEAD~${count}`,
  ]);

  if (result.exitCode !== 0) {
    throw new Error(
      `Unable to squash ${count} commits: not enough history before HEAD`
    );
  }
};

/**
 * Move HEAD back `count` commits, keeping their changes staged
 */
export const softReset = async (count: number) => {
  try {
    await x("git", ["reset", "--soft", `HEAD~${count}`], {
      throwOnError: true,
    });
  } catch (error) {
    throw new Error(`Unable to squash ${count} commits (git reset failed)`, {
      cause: error,
    });
  }
};
