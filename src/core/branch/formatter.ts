/**
 * Branch name formatting
 * Takes branch parts and config, returns a formatted branch name string
 */

import type { BranchConfig } from "@/core/config/types";

import type { BranchParts } from "./types";

/**
 * Slugify a string segment for use in branch names
 * Lowercases, replaces non-alphanumeric chars (except dash/dot) with a dash,
 * and collapses consecutive dashes
 */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9.]+/gu, "-")
    .replaceAll(/-+/gu, "-")
    .replaceAll(/^-|-$/gu, "");

/**
 * Replace pattern tokens with resolved values, then clean up
 * empty segments and consecutive separators
 *
 * @param pattern - Branch pattern template (e.g. "{type}/{scope}/{issue}-{subject}")
 *
 * @param tokens - Map of token name to resolved string value
 *
 * @returns Formatted branch name segment string
 */
const applyPattern = (
  pattern: string,
  tokens: Record<string, string>
): string => {
  let result = pattern;

  for (const [token, value] of Object.entries(tokens)) {
    result = result.replaceAll(`{${token}}`, value);
  }

  result = result.replaceAll(/\/+/gu, "/");
  result = result.replaceAll(/\/[-_]+/gu, "/");
  result = result.replaceAll(/[-_]+\//gu, "/");
  result = result.replaceAll(/^\/|\/$/gu, "");

  return result;
};

/**
 * Format branch parts into a branch name string
 *
 * @param parts - The branch parts (type, scope, issue, subject)
 *   Issue refs keep their case (e.g. "PROJ-123", "#42"); whitespace, control
 *   characters, "..", "@{" and ~ ^ : ? * [ \ become a dash
 *
 * @param config - Branch configuration (pattern, max)
 *
 * @returns Formatted branch name. Each "/" segment collapses runs of dots and
 *   drops leading dashes, underscores and dots, and trailing dots and ".lock";
 *   the name is then truncated to config.max characters with trailing dashes,
 *   underscores, slashes, dots and ".lock" removed
 */
export const formatBranchName = (parts: BranchParts, config: BranchConfig) => {
  const { max, pattern } = config;

  const tokens = {
    issue:
      parts.issue
        ?.trim()
        .replaceAll(/(?:\.\.|@\{|[\s\p{Cc}~^:?*[\\])+/gu, "-") ?? "",
    scope: parts.scope === undefined ? "" : slugify(parts.scope),
    subject: slugify(parts.subject),
    type: slugify(parts.type),
  } satisfies Record<string, string>;

  const formatted = applyPattern(pattern, tokens)
    .split("/")
    .map((segment) =>
      segment
        .replaceAll(/\.{2,}/gu, ".")
        .replace(/^[-_.]+/u, "")
        .replace(/(?:\.lock|\.)+$/u, "")
    )
    .filter(Boolean)
    .join("/");

  return formatted.slice(0, max).replace(/(?:\.lock|[-_/.])+$/u, "");
};
