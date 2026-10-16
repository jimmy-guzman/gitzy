/**
 * Git amend operations — parse existing HEAD commit for pre-filling
 */

import { x } from "tinyexec";

import type { MessageParts } from "@/core/conventional/types";

/**
 * A single emoji, including multi-codepoint sequences (skin-tone modifiers,
 * ZWJ joins like "👩‍💻", and the "️" variation selector used by "⚡️")
 */
const EMOJI = String.raw`\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|️)?(?:‍\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|️)?)*`;

/**
 * Matches: type(scope)!: subject  or  type!: subject  or  type(scope): subject  or  type: subject
 * Strips a leading emoji if present (e.g. "✨ subject" → "subject")
 */
const HEADER_REGEX = new RegExp(
  String.raw`^(?<type>[\w-]+)(?:\((?<scope>[^)]*)\))?(?<breaking>!)?: (?:${EMOJI}\s)?(?<subject>.+)$`,
  "u"
);

/**
 * Matches a BREAKING CHANGE/BREAKING-CHANGE footer, optional leading emoji,
 * continuing through any indented wrapped lines that follow it
 */
const BREAKING_FOOTER_REGEX = new RegExp(
  String.raw`^BREAKING[ -]CHANGE:\s*(?:${EMOJI}\s)?(?<breaking>.+(?:\n[ \t]+\S.*)*)$`,
  "imu"
);

/**
 * An issue reference: #123, org/repo#123, an issue URL, or a Jira key like PROJ-123.
 * Matches a lowercase Jira-shaped key too (e.g. "task-1") so it can be rejected by
 * `isRealIssueRef` below — Node's regex engine has no inline case-insensitivity toggle.
 */
const ISSUE_REF = String.raw`[\w.-]+\/[\w.-]+#\d+|#\d+|https?:\/\/\S+|[A-Za-z][A-Za-z0-9]*-\d+`;

/**
 * One Closes/Fixes/Resolves clause with a possible issue reference and an
 * optional colon (e.g. "Closes: #123"). Has a single `ref` capture group so
 * it's safe to reuse with `matchAll` to pull every clause out of a line.
 */
const ISSUE_CLAUSE_REGEX = new RegExp(
  String.raw`(?:Closes|Fixes|Resolves):?\s+(?<ref>${ISSUE_REF})`,
  "gimu"
);

/**
 * Matches a whole line made of one or more comma-separated Closes/Fixes/
 * Resolves clauses, with an optional leading emoji (e.g. "🏁 Closes #1,
 * Fixes #2") — this is the shape `formatMessageResult` writes for multiple
 * issues on one line
 */
const ISSUES_LINE_REGEX = new RegExp(
  String.raw`^(?:${EMOJI}\s)?(?:${ISSUE_CLAUSE_REGEX.source}(?:,\s*)?)+$`,
  "imu"
);

/** Matches a BREAKING CHANGE or trailer line on its own */
const BREAKING_OR_TRAILER_LINE_REGEX =
  /^(?:BREAKING[ -]CHANGE:.+|Co-authored-by:.+|Signed-off-by:.+)$/imu;

/** Matches an indented continuation of a wrapped footer line */
const CONTINUATION_LINE_REGEX = /^[ \t]+\S/u;

/** A Jira key is only real when it's genuinely uppercase, never case-insensitively */
const JIRA_KEY_REGEX = /^[A-Za-z][A-Za-z0-9]*-\d+$/u;
const UPPERCASE_JIRA_KEY_REGEX = /^[A-Z][A-Z0-9]*-\d+$/u;

const isRealIssueRef = (ref: string) =>
  !JIRA_KEY_REGEX.test(ref) || UPPERCASE_JIRA_KEY_REGEX.test(ref);

/**
 * Extracts every real issue reference from a footer line, or an empty array
 * when the line isn't a Closes/Fixes/Resolves line or any of its refs are fake
 */
const issueRefsInLine = (line: string): string[] => {
  if (!ISSUES_LINE_REGEX.test(line)) {
    return [];
  }

  const refs = [...line.matchAll(ISSUE_CLAUSE_REGEX)].map(
    (m) => m.groups?.ref ?? ""
  );

  return refs.every(isRealIssueRef) ? refs : [];
};

/**
 * Whether a line anchors a footer: BREAKING CHANGE, a trailer, or
 * Closes/Fixes/Resolves followed by one or more real issue references. An
 * indented continuation line only counts as part of the footer once an
 * anchor has already appeared in the same paragraph — otherwise an indented
 * body paragraph (a quoted snippet, a code block) would be mistaken for one.
 */
const isFooterAnchorLine = (line: string) =>
  BREAKING_OR_TRAILER_LINE_REGEX.test(line) || issueRefsInLine(line).length > 0;

/**
 * Whether a whole paragraph is a footer: every line is either a footer
 * anchor or an indented continuation of one, and at least one anchor exists
 */
const isFooterParagraph = (paragraph: string) => {
  let sawAnchor = false;

  for (const line of paragraph.split("\n")) {
    if (isFooterAnchorLine(line)) {
      sawAnchor = true;
      continue;
    }

    if (!(sawAnchor && CONTINUATION_LINE_REGEX.test(line))) {
      return false;
    }
  }

  return sawAnchor;
};

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
    isFooterParagraph(paragraphs[footerStart - 1] ?? "")
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

  const issueMatches = footerText.split("\n").flatMap(issueRefsInLine);

  if (issueMatches.length > 0) {
    result.issues = issueMatches;
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
