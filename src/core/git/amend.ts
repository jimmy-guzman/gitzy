/**
 * Git amend operations — parse existing HEAD commit for pre-filling
 */

import { x } from "tinyexec";

import type { MessageParts } from "@/core/conventional/types";

/**
 * Parsed result from HEAD commit message
 * All fields are optional — regex-based best-effort parsing
 */
type ParsedCommit = Partial<
  Pick<
    MessageParts,
    "body" | "breaking" | "issues" | "scope" | "subject" | "type"
  >
>;

/**
 * Matches: type(scope)!: subject  or  type!: subject  or  type(scope): subject  or  type: subject
 * Strips leading emoji if present (e.g. "✨ subject" → "subject")
 */
const HEADER_REGEX =
  /^(?<type>[a-z]+)(?:\((?<scope>[^)]*)\))?(?<breaking>!)?: (?:\p{Emoji_Presentation}\s)?(?<subject>.+)$/u;

/**
 * Matches: BREAKING CHANGE: <text> or BREAKING-CHANGE: <text> (optionally preceded by emoji)
 */
const BREAKING_FOOTER_REGEX =
  /^BREAKING[ -]CHANGE: (?:\p{Emoji_Presentation}\s)?(?<breaking>.+)$/mu;

/**
 * Matches: Closes/Fixes/Resolves <ref> — with optional leading emoji (e.g. "🏁 Closes #123")
 */
const ISSUES_FOOTER_REGEX =
  /^(?:\p{Emoji_Presentation} )?(?:Closes|Fixes|Resolves) (?<ref>\S.*)$/gmu;

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
export const parseConventionalCommit = (message: string): ParsedCommit => {
  const lines = message.split("\n");
  const header = lines[0] ?? "";
  const rest = lines.slice(1).join("\n").trim();

  const headerMatch = HEADER_REGEX.exec(header);

  if (!headerMatch?.groups) {
    return { subject: header.trim() };
  }

  const { breaking: bangBreaking, scope, subject, type } = headerMatch.groups;
  const result: ParsedCommit = { subject, type };

  if (scope) result.scope = scope;

  const footerStart = rest.search(
    /^(?:\p{Emoji_Presentation}\s)?(?:BREAKING CHANGE|Co-authored-by|Closes|Fixes|Resolves)/mu,
  );
  const bodyText =
    footerStart === -1 ? rest : rest.slice(0, footerStart).trim();

  if (bodyText) result.body = bodyText;

  const breakingMatch = BREAKING_FOOTER_REGEX.exec(rest);

  if (breakingMatch?.groups?.breaking) {
    result.breaking = breakingMatch.groups.breaking;
  } else if (bangBreaking === "!") {
    result.breaking = true;
  }

  const issueMatches = [...rest.matchAll(ISSUES_FOOTER_REGEX)];

  if (issueMatches.length > 0) {
    result.issues = issueMatches
      .map((m) => m.groups?.ref ?? "")
      .filter(Boolean);
  }

  return result;
};

/**
 * Read and parse the HEAD commit for pre-filling amend prompts
 *
 * @returns Parsed commit parts from HEAD, or empty object if parsing fails
 */
export const getAmendParts = async (): Promise<ParsedCommit> => {
  try {
    const message = await getHeadCommitMessage();

    return parseConventionalCommit(message);
  } catch {
    return {};
  }
};
