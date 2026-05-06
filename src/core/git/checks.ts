import { x } from "tinyexec";

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
      'No files staged \nYou can use "git add" to stage files before committing',
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
    throw new Error('Not a git repository \nYou can try running "git init"', {
      cause: error,
    });
  }
};

/**
 * Determines whether or not to perform git checks based on flags
 */
export const shouldDoGitChecks = (
  cliFlags: { amend?: boolean; dryRun?: boolean; hook?: boolean } = {},
) => {
  if (cliFlags.dryRun || cliFlags.hook || cliFlags.amend) {
    return false;
  }

  return true;
};
