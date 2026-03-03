/**
 * Conventional commit message formatting
 * Takes message parts and config, returns formatted commit message string
 */

import type { Config } from "@/core/config/types";

import { validIssuesPrefixes } from "@/core/config/defaults";

import type { MessageParts } from "./types";

const MAX_WIDTH = 72;

const createBreaking = (
  breaking: boolean | string,
  { breakingChangeEmoji, breakingChangeFormat, disableEmoji }: Config,
) => {
  if (breakingChangeFormat === "!" || typeof breaking === "boolean") {
    return "";
  }

  const emoji = disableEmoji ? "" : `${breakingChangeEmoji} `;

  return breaking ? `\n\nBREAKING CHANGE: ${emoji}${breaking}` : "";
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const prefixPattern = validIssuesPrefixes.join("|");
const hasPrefixRegex = new RegExp(String.raw`^(${prefixPattern})\s+`, "i");

const parseIssue = (issue: string, defaultPrefix: string) => {
  const trimmed = issue.trim();

  if (!trimmed) return null;

  const match = hasPrefixRegex.exec(trimmed);

  if (match) {
    const [fullMatch, prefix] = match;
    const issueRef = trimmed.slice(fullMatch.length).trim();

    return `${capitalize(prefix)} ${issueRef}`;
  }

  return `${capitalize(defaultPrefix)} ${trimmed}`;
};

const createIssues = (
  issues: string,
  { closedIssueEmoji, disableEmoji, issuesPrefix }: Config,
) => {
  if (!issues) return "";

  const formatted = issues
    .split(/\s*,\s*/)
    .map((issue) => parseIssue(issue, issuesPrefix))
    .filter(Boolean)
    .join(", ");

  const emojiPrefix = disableEmoji ? "" : `${closedIssueEmoji} `;

  return `\n\n${emojiPrefix}${formatted}`;
};

const createScope = (scope: string) => {
  return scope && scope !== "none" ? `(${scope})` : "";
};

const createHead = (
  parts: MessageParts,
  scope: string,
  config: Config,
  emojiPrefix: string,
) => {
  const breakingIndicator =
    config.breakingChangeFormat !== "footer" && parts.breaking ? "!" : "";

  return `${parts.type + scope}${breakingIndicator}: ${emojiPrefix}${parts.subject}`;
};

export const wrap = (string: string, maxWidth = MAX_WIDTH) => {
  const regex = new RegExp(
    String.raw`(?![^\n]{1,${maxWidth.toString()}}$)([^\n]{1,${maxWidth.toString()}})\s`,
    "g",
  );

  return string.replace(regex, "$1\n");
};

/**
 * Format message parts into a conventional commit message
 *
 * @param config - Configuration for formatting
 *
 * @param parts - The message data (type, scope, subject, etc)
 *
 * @param emoji - Whether to include emojis (can override config)
 *
 * @returns Formatted commit message string
 */
export const formatMessage = (
  config: Config,
  parts: MessageParts,
  emoji: boolean,
) => {
  const typeDetail = Object.hasOwn(config.details, parts.type)
    ? config.details[parts.type]
    : undefined;
  const hasEmoji = !config.disableEmoji && typeDetail?.emoji && emoji;
  const emojiPrefix = hasEmoji ? `${typeDetail.emoji} ` : "";
  const scope = createScope(parts.scope);
  const head = createHead(parts, scope, config, emojiPrefix);
  const body = parts.body.trim() ? `\n\n${parts.body}` : "";
  const breaking = createBreaking(parts.breaking, config);
  const issues = createIssues(parts.issues, config);
  const maxWidth = Math.max(config.headerMaxLength, MAX_WIDTH);

  return wrap(`${head}${body}${breaking}${issues}`, maxWidth);
};
