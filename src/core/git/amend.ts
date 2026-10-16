/**
 * Git amend operations — parse existing HEAD commit for pre-filling
 */

import { x } from "tinyexec";

import type { MessageParts } from "@/core/conventional/types";

/**
 * Matches: type(scope)!: subject  or  type!: subject  or  type(scope): subject  or  type: subject
 * Strips leading emoji if present (e.g. "✨ subject" → "subject")
 */
const HEADER_REGEX =
  /^(?<type>[\w-]+)(?:\((?<scope>[^)]*)\))?(?<breaking>!)?: (?:\p{Extended_Pictographic}️?\s)?(?<subject>.+)$/u;

/**
 * Matches: BREAKING CHANGE: <text> or BREAKING-CHANGE: <text> (optionally preceded by emoji)
 */
const BREAKING_FOOTER_REGEX =
  /^BREAKING[ -]CHANGE: (?:\p{Extended_Pictographic}️?\s)?(?<breaking>.+)$/mu;

/**
 * An issue reference: #123, org/repo#123, an issue URL, or a Jira key like PROJ-123
 */
const ISSUE_REF = String.raw`[\w.-]+\/[\w.-]+#\d+|#\d+|https?:\/\/\S+|(?-i:[A-Z][A-Z0-9]*-\d+)`;

/**
 * Closes/Fixes/Resolves followed by a real issue reference, with optional
 * leading emoji (e.g. "🏁 Closes #123"). Shared by FOOTER_LINE_REGEX and
 * ISSUES_FOOTER_REGEX so the two stay in sync.
 */
const ISSUES_LINE = String.raw`(?:\p{Extended_Pictographic}️?\s)?(?:Closes|Fixes|Resolves)\s+(?<ref>${ISSUE_REF})\s*`;

/**
 * Matches a whole line that is a footer line: BREAKING CHANGE, Co-authored-by,
 * Signed-off-by, or Closes/Fixes/Resolves followed by a real issue reference
 */
const FOOTER_LINE_REGEX = new RegExp(
  String.raw`^(?:BREAKING[ -]CHANGE: .+|Co-authored-by:.+|Signed-off-by:.+|${ISSUES_LINE})$`,
  "imu"
);

/**
 * Matches: Closes/Fixes/Resolves <ref> — with optional leading emoji (e.g. "🏁 Closes #123")
 */
const ISSUES_FOOTER_REGEX = new RegExp(String.raw`^${ISSUES_LINE}$`, "gimu");

/**
 * Get the HEAD commit message
 */
export const getHeadCommitMessage = async () => {
  const result = await x("git", ["log", "-1", "--pretty=%B"], {
    throwOnError: true,
  });

  return result.stdout.trim();
};

/**
 * Parse a conventional commit message into its parts (best-effort, regex-based)
 *
 * @param message - Raw commit message string
 *
 * @returns Partial MessageParts — only fields that could be parsed are set
 */
export const parseConventionalCommit = (message: string) => {
  const lines = message.split("\n");
  const header = lines[0] ?? "";
  const rest = lines.slice(1).join("\n").trim();

  const headerMatch = HEADER_REGEX.exec(header);

  if (!headerMatch?.groups) {
    return { subject: header.trim() };
  }

  const { breaking: bangBreaking, scope, subject, type } = headerMatch.groups;
  const result: Partial<MessageParts> = { subject, type };

  if (scope) {
    result.scope = scope;
  }

  const paragraphs = rest.split(/\n\s*\n/u).filter(Boolean);
  let footerStart = paragraphs.length;

  while (
    footerStart > 0 &&
    (paragraphs[footerStart - 1] ?? "")
      .split("\n")
      .every((line) => FOOTER_LINE_REGEX.test(line))
  ) {
    footerStart -= 1;
  }

  const bodyText = paragraphs.slice(0, footerStart).join("\n\n").trim();
  const footerText = paragraphs.slice(footerStart).join("\n\n");

  if (bodyText) {
    result.body = bodyText;
  }

  const breakingMatch = BREAKING_FOOTER_REGEX.exec(footerText);

  if (breakingMatch?.groups?.breaking !== undefined) {
    result.breaking = breakingMatch.groups.breaking;
  } else if (bangBreaking === "!") {
    result.breaking = true;
  }

  const issueMatches = [...footerText.matchAll(ISSUES_FOOTER_REGEX)];

  if (issueMatches.length > 0) {
    result.issues = issueMatches
      .map((m) => m.groups?.ref ?? "")
      .filter(Boolean);
  }

  const signoffMatch = /^Signed-off-by:(?<signoff>.+)$/imu.exec(footerText);
  const signoff = signoffMatch?.groups?.signoff.trim();

  if (signoff !== undefined && signoff !== "") {
    result.signoff = signoff;
  }

  const coAuthors = [
    ...footerText.matchAll(/^Co-authored-by:(?<coAuthor>.+)$/gimu),
  ]
    .map((m) => m.groups?.coAuthor.trim() ?? "")
    .filter(Boolean);

  if (coAuthors.length > 0) {
    result.coAuthors = coAuthors;
  }

  return result;
};

/**
 * Read and parse the HEAD commit for pre-filling amend prompts
 *
 * @returns Parsed commit parts from HEAD, or empty object if parsing fails
 */
export const getAmendParts = async () => {
  try {
    const message = await getHeadCommitMessage();

    return parseConventionalCommit(message);
  } catch {
    return {};
  }
};
