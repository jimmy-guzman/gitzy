/**
 * Git branch operations — rename and create branches
 */

import { x } from "tinyexec";

import type { BranchParts } from "@/core/branch/types";
import type { ResolvedConfig } from "@/core/config/types";

import { formatBranchName } from "@/core/branch/formatter";

interface RenameBranchOptions {
  checkout?: boolean;
  dryRun?: boolean;
}

interface RenameBranchResult {
  hasRemote: boolean;
  newName: string;
  oldName: string;
}

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

/**
 * Rename the current branch using `git branch -m`
 * Warns if a remote tracking ref exists (manual push/delete required)
 *
 * @param newName - The new branch name
 *
 * @param options - Rename options
 *
 * @param options.checkout - Checkout the new branch after renaming (no-op: rename keeps HEAD)
 *
 * @param options.dryRun - Show result without executing git commands
 *
 * @returns Result with old/new names and whether a remote tracking ref existed
 */
export const renameBranch = async (
  newName: string,
  { checkout: _checkout = true, dryRun = false }: RenameBranchOptions = {},
): Promise<RenameBranchResult> => {
  const oldName = await getCurrentBranch();
  const hasRemote = await hasRemoteTracking(oldName);

  if (dryRun) {
    return { hasRemote, newName, oldName };
  }

  const result = await x("git", ["branch", "-m", oldName, newName], {
    nodeOptions: { stdio: "inherit" },
  });

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
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
  from?: string,
): Promise<{ branchName: string }> => {
  if (dryRun) {
    return { branchName };
  }

  if (checkout) {
    const args = from
      ? ["checkout", "-b", branchName, from]
      : ["checkout", "-b", branchName];

    const result = await x("git", args, {
      nodeOptions: { stdio: "inherit" },
    });

    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  } else {
    const args = from ? ["branch", branchName, from] : ["branch", branchName];

    const result = await x("git", args, {
      nodeOptions: { stdio: "inherit" },
    });

    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  }

  return { branchName };
};

export interface BranchOptions {
  checkout?: boolean;
  dryRun?: boolean;
  from?: string;
}

export interface BranchResult {
  branch: string;
  created: boolean;
}

/**
 * Format branch parts into a branch name and optionally create the branch
 *
 * @param config - Resolved configuration for formatting
 *
 * @param parts - The branch parts (type, scope, issue, subject)
 *
 * @param options - Branch options
 *
 * @param options.checkout - Whether to checkout the new branch (default: true)
 *
 * @param options.dryRun - Show result without creating branch
 *
 * @param options.from - Base branch or ref to create the branch from
 *
 * @returns Branch result with formatted name and whether it was created
 */
export const branch = async (
  config: ResolvedConfig,
  parts: BranchParts,
  options?: BranchOptions,
): Promise<BranchResult> => {
  const { checkout = true, dryRun = false, from } = options ?? {};
  const branchName = formatBranchName(parts, config.branch);

  await createBranch(branchName, checkout, dryRun, from);

  return { branch: branchName, created: !dryRun };
};
