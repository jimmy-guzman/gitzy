/**
 * Branch name formatting
 * Takes branch parts and config, returns a formatted branch name string
 */

import type { BranchConfig } from "@/core/config/types";

import type { BranchParts } from "./types";

/**
 * Slugify a string segment using the given separator
 * Lowercases, replaces non-alphanumeric chars (except dash/dot) with the separator,
 * and collapses consecutive separators
 */
export const slugify = (value: string, separator = "-") => {
  const sep = separator || "-";
  const escapedSep = sep.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9.]+/g, sep)
    .replaceAll(new RegExp(`${escapedSep}+`, "g"), sep)
    .replaceAll(new RegExp(`^${escapedSep}|${escapedSep}$`, "g"), "");
};

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
  tokens: Record<string, string>,
): string => {
  let result = pattern;

  for (const [token, value] of Object.entries(tokens)) {
    result = result.replaceAll(`{${token}}`, value);
  }

  result = result.replaceAll(/\/+/g, "/");
  result = result.replaceAll(/\/[-_]+/g, "/");
  result = result.replaceAll(/[-_]+\//g, "/");
  result = result.replaceAll(/\/+/g, "/");
  result = result.replaceAll(/^\/|\/$/g, "");

  return result;
};

/**
 * Format branch parts into a branch name string
 *
 * @param parts - The branch parts (type, scope, issue, subject)
 *
 * @param config - Branch configuration (pattern, separator, max)
 *
 * @returns Formatted branch name, truncated to config.max characters
 */
export const formatBranchName = (
  parts: BranchParts,
  config: BranchConfig,
): string => {
  const { max, pattern, separator } = config;

  const tokens: Record<string, string> = {
    // Issue refs are kept as-is (e.g. "PROJ-123", "#42") — no slug conversion
    issue: parts.issue?.trim() ?? "",
    scope: parts.scope ? slugify(parts.scope, separator) : "",
    subject: slugify(parts.subject, separator),
    type: slugify(parts.type, separator),
  };

  const formatted = applyPattern(pattern, tokens);

  return formatted.slice(0, max);
};
