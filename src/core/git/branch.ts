/**
 * Git branch operations — rename and create branches
 */

import { x } from "tinyexec";

/**
 * Get the current branch name
 */
export const getCurrentBranch = async () => {
  const result = await x("git", ["branch", "--show-current"], {
    throwOnError: true,
  });

  return result.stdout.trim();
};

/**
 * Check whether the current branch has a remote tracking ref
 */
const hasRemoteTracking = async (branchName: string) => {
  const result = await x("git", [
    "config",
    "--get",
    `branch.${branchName}.remote`,
  ]);

  return result.exitCode === 0;
};

const runGit = async (args: string[], errorPrefix: string) => {
  const result = await x("git", args, {
    nodeOptions: { stdio: "pipe" },
  });

  if (result.exitCode !== 0) {
    throw new Error(
      `${errorPrefix} failed with exit code ${(result.exitCode ?? 1).toString()}${result.stderr ? `: ${result.stderr}` : ""}`
    );
  }
};

const assertValidBranchName = async (branchName: string) => {
  const result = await x("git", ["check-ref-format", "--branch", branchName]);

  if (result.exitCode !== 0) {
    throw new Error(`"${branchName}" is not a valid git branch name`);
  }
};

/**
 * Rename the current branch using `git branch -m`
 * Warns if a remote tracking ref exists (manual push/delete required)
 *
 * @param newName - The new branch name
 *
 * @param options - Rename options
 *
 * @param options.dryRun - Show result without executing git commands
 *
 * @returns Result with old/new names and whether a remote tracking ref existed
 */
export const renameBranch = async (
  newName: string,
  { dryRun = false } = {}
) => {
  await assertValidBranchName(newName);

  const oldName = await getCurrentBranch();
  const hasRemote = await hasRemoteTracking(oldName);

  if (!dryRun) {
    await runGit(["branch", "-m", oldName, newName], "git branch -m");
  }

  return { hasRemote, newName, oldName };
};

/**
 * Create a new branch and optionally check it out
 *
 * @param branchName - The branch name to create
 *
 * @param checkout - Whether to checkout the new branch (default: true)
 *
 * @param dryRun - Show result without executing git commands
 *
 * @param from - Base branch or ref to create the branch from
 */
export const createBranch = async (
  branchName: string,
  checkout = true,
  dryRun = false,
  from?: string
) => {
  await assertValidBranchName(branchName);

  if (dryRun) {
    return;
  }

  const fromArgs = from !== undefined && from !== "" ? [from] : [];

  await (checkout
    ? runGit(["checkout", "-b", branchName, ...fromArgs], "git checkout -b")
    : runGit(["branch", branchName, ...fromArgs], "git branch"));
};
