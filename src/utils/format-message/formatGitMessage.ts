import type { Answers, GitzyConfig } from "../../interfaces";

const MAX_WIDTH = 72;

const normalizeMessage = (message: string) => {
  return message.replaceAll('"', String.raw`\"`).replaceAll("`", "\\`");
};

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

const createIssues = (
  issues: string,
  { closedIssueEmoji, disableEmoji }: GitzyConfig,
) => {
  return issues
    ? `\n\n${disableEmoji ? "" : `${closedIssueEmoji} `}Closes: ${issues}`
    : "";
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

export const formatCommitMessage = (
  config: GitzyConfig,
  answers: Answers,
  emoji: boolean,
  isHook = false,
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

  const message = wrap(`${head}${body}${breaking}${issues}`, maxWidth);

  return isHook ? message : normalizeMessage(message);
};
