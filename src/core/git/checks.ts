import { x } from "tinyexec";

const hasStagedChanges = async () => {
  const result = await x("git", [
    "--no-pager",
    "diff",
    "--cached",
    "--quiet",
    "--exit-code",
  ]);

  if (result.exitCode !== 0 && result.exitCode !== 1) {
    throw new Error("Failed to check staged files (git diff)");
  }

  return result.exitCode === 1;
};

/**
 * Determines whether or not files are staged.
 */
export const checkIfStaged = async () => {
  if (!(await hasStagedChanges())) {
    throw new Error(
      'No files staged \nYou can use "git add" to stage files before committing'
    );
  }
};

/**
 * Ensures nothing is staged, so unrelated changes don't end up in a squash.
 */
export const checkIfNothingStaged = async () => {
  if (await hasStagedChanges()) {
    throw new Error(
      "Staged changes found \nCommit or unstage them before squashing"
    );
  }
};

/**
 * Determines whether or not it's a git repository.
 */
export const checkIfGitRepo = async () => {
  try {
    await x("git", ["rev-parse", "--is-inside-work-tree"], {
      throwOnError: true,
    });
  } catch (error) {
    throw new Error('Not a git repository \nYou can try running "git init"', {
      cause: error,
    });
  }
};
