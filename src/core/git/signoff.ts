/**
 * Git sign-off — resolve the committer identity for a Signed-off-by trailer
 */

import { x } from "tinyexec";

/**
 * Resolve the committer identity for a Signed-off-by trailer.
 *
 * Reads `git var GIT_COMMITTER_IDENT` ("Name <email> 1700000000 -0700") and
 * returns just the "Name <email>" portion.
 *
 * @returns The committer identity, or "" when no git identity is configured
 *   (so no trailer is added)
 */
export const getSignoffTrailer = async () => {
  try {
    const result = await x("git", ["var", "GIT_COMMITTER_IDENT"], {
      throwOnError: true,
    });
    const match = /^(.*>)/.exec(result.stdout.trim());

    return match?.[1] ?? "";
  } catch {
    return "";
  }
};
