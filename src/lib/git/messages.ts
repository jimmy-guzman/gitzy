import type { Answers, GitzyConfig } from "@/interfaces";

import { isValidIssues } from "@/config/validation/validators";
import { validIssuesPrefixes } from "@/defaults/config";

const MAX_WIDTH = 72;

const createBreaking = (
  breaking: string,
  { breakingChangeEmoji, disableEmoji }: GitzyConfig,
) => {
  return breaking
    ? `\n\nBREAKING CHANGE: ${
        disableEmoji ? "" : `${breakingChangeEmoji} `
      }${breaking}`
    : "";
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const createIssues = (
  issues: string,
  { closedIssueEmoji, disableEmoji, issuesPrefix = "closes" }: GitzyConfig,
) => {
  if (!issues) return "";

  const prefixPattern = validIssuesPrefixes.join("|");
  const hasPrefixRegex = new RegExp(`^(${prefixPattern})\\s+`, "i");

  const validPrefix = isValidIssues(issuesPrefix) ? issuesPrefix : "closes";

  const formattedIssues = issues
    .split(",")
    .map((issue) => {
      const trimmed = issue.trim();

      if (!trimmed) return null;

      const match = trimmed.match(hasPrefixRegex);

      if (match) {
        const prefix = capitalize(match[1]);
        const issueRef = trimmed.slice(match[0].length);

        return `${prefix} ${issueRef}`;
      }

      return `${capitalize(validPrefix)} ${trimmed}`;
    })
    .filter(Boolean)
    .join(", ");

  const emojiPrefix = disableEmoji ? "" : `${closedIssueEmoji} `;

  return `\n\n${emojiPrefix}${formattedIssues}`;
};

const createScope = (scope: string) => {
  return scope && scope !== "none" ? `(${scope})` : "";
};

export const wrap = (string: string, maxWidth = MAX_WIDTH) => {
  const regex = new RegExp(
    `(?![^\\n]{1,${maxWidth.toString()}}$)([^\\n]{1,${maxWidth.toString()}})\\s`,
    "g",
  );

  return string.replace(regex, "$1\n");
};

export const formatMessage = (
  config: GitzyConfig,
  answers: Answers,
  emoji: boolean,
) => {
  const hasEmoji =
    !config.disableEmoji && config.details[answers.type].emoji && emoji;
  const emojiPrefix = hasEmoji ? `${config.details[answers.type].emoji} ` : "";
  const scope = createScope(answers.scope);
  const head = `${answers.type + scope}: ${emojiPrefix}${answers.subject}`;
  const body = answers.body.trim() ? `\n\n${answers.body}` : "";
  const breaking = createBreaking(answers.breaking, config);
  const issues = createIssues(answers.issues, config);
  const maxWidth = Math.max(config.headerMaxLength, MAX_WIDTH);

  return wrap(`${head}${body}${breaking}${issues}`, maxWidth);
};
