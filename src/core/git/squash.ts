import { x } from "tinyexec";

/**
 * Get the symbolic default remote branch ref (e.g. "origin/main").
 * Falls back to "origin/main" if no remote HEAD is configured.
 */
export const getDefaultBranch = async (): Promise<string> => {
  try {
    const result = await x(
      "git",
      ["symbolic-ref", "refs/remotes/origin/HEAD"],
      { throwOnError: true },
    );

    return result.stdout.trim().replace("refs/remotes/", "");
  } catch {
    return "origin/main";
  }
};

/**
 * Count how many commits HEAD is ahead of a base ref.
 */
export const getCommitsAheadCount = async (base: string): Promise<number> => {
  try {
    const result = await x("git", ["rev-list", "--count", `HEAD`, `^${base}`], {
      throwOnError: true,
    });

    const count = Number.parseInt(result.stdout.trim(), 10);

    if (Number.isNaN(count)) {
      throw new TypeError(
        `Unable to determine commits ahead of "${base}". Use --count to specify manually.`,
      );
    }

    return count;
  } catch {
    throw new Error(
      `Unable to determine commits ahead of "${base}". Use --count to specify manually.`,
    );
  }
};

/**
 * Soft-reset HEAD~N (keeps all changes staged).
 * No-ops in dryRun mode.
 */
export const softReset = async (count: number, dryRun = false) => {
  if (dryRun) {
    return;
  }

  const result = await x("git", ["reset", "--soft", `HEAD~${String(count)}`]);

  if (result.exitCode !== 0) {
    throw new Error(
      `git reset failed (exit ${String(result.exitCode)}): ${result.stderr || result.stdout}`,
    );
  }
};
