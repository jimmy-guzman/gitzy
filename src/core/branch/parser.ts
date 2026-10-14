/**
 * Branch name parsing
 * Recovers branch parts from an existing `type/scope/issue-subject` branch name
 */

import type { BranchParts } from "./types";

const ISSUE_PREFIX = /^(?<issue>#\d+|[A-Z]+-\d+)-(?<rest>.+)$/u;

/**
 * Parse a branch name back into its parts (best-effort, used by `--amend`)
 *
 * @param name - The branch name, e.g. `feat/ui/PROJ-123-add-dark-mode`
 * @param scopes - Known scope names; the second segment is only a scope when listed here
 *
 * @returns The parsed branch parts
 */
export const parseBranchName = (
  name: string,
  scopes: string[]
): BranchParts => {
  const segments = name.split("/");
  const hasScope = scopes.includes(segments.at(1) ?? "");
  const rawSubjectStart = hasScope ? segments.slice(2) : segments.slice(1);

  const issuePrefix = ISSUE_PREFIX.exec(rawSubjectStart[0] ?? "");
  const issue = issuePrefix?.groups?.issue;
  const firstSubjectSegment = issuePrefix
    ? issuePrefix.groups?.rest
    : rawSubjectStart[0];
  const subjectSegments = [
    firstSubjectSegment,
    ...rawSubjectStart.slice(1),
  ].filter(Boolean);

  return {
    ...(issue === undefined ? {} : { issue }),
    ...(hasScope ? { scope: segments[1] } : {}),
    subject: subjectSegments.join("-"),
    type: segments[0] ?? "",
  };
};
