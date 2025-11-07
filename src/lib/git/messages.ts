import type { Config } from "@/config/gitzy-schema";
import type { Answers } from "@/interfaces";

import { validIssuesPrefixes } from "@/defaults/config";

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
  { closedIssueEmoji, disableEmoji, issuesPrefix = "closes" }: Config,
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
  answers: Answers,
  scope: string,
  config: Config,
  emojiPrefix: string,
) => {
  const breakingIndicator =
    config.breakingChangeFormat !== "footer" && answers.breaking ? "!" : "";

  return `${answers.type + scope}${breakingIndicator}: ${emojiPrefix}${answers.subject}`;
};

export const wrap = (string: string, maxWidth = MAX_WIDTH) => {
  const regex = new RegExp(
    String.raw`(?![^\n]{1,${maxWidth.toString()}}$)([^\n]{1,${maxWidth.toString()}})\s`,
    "g",
  );

  return string.replace(regex, "$1\n");
};

export const formatMessage = (
  config: Config,
  answers: Answers,
  emoji: boolean,
) => {
  const hasEmoji =
    !config.disableEmoji && config.details[answers.type].emoji && emoji;
  const emojiPrefix = hasEmoji ? `${config.details[answers.type].emoji} ` : "";
  const scope = createScope(answers.scope);
  const head = createHead(answers, scope, config, emojiPrefix);
  const body = answers.body.trim() ? `\n\n${answers.body}` : "";
  const breaking = createBreaking(answers.breaking, config);
  const issues = createIssues(answers.issues, config);
  const maxWidth = Math.max(config.headerMaxLength, MAX_WIDTH);

  return wrap(`${head}${body}${breaking}${issues}`, maxWidth);
};
