/**
 * Conventional commit message formatting
 * Takes message parts and config, returns formatted commit message string
 */

import type { ResolvedConfig } from "@/core/config/types";

import type { MessageParts } from "./types";

const MAX_WIDTH = 72;

const GITHUB_PREFIXES = [
  "close",
  "closed",
  "closes",
  "fix",
  "fixed",
  "fixes",
  "resolve",
  "resolved",
  "resolves",
] as const;

const hasPrefixRegex = new RegExp(
  String.raw`^(${GITHUB_PREFIXES.join("|")})\s+`,
  "i",
);

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const parseGithubIssue = (issue: string, defaultPrefix: string) => {
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

const parseJiraIssue = (issue: string) => {
  const trimmed = issue.trim();

  return trimmed || null;
};

const createBreaking = (
  breaking: boolean | string,
  { breaking: breakingCfg, emoji: emojiCfg }: ResolvedConfig,
  emojiEnabled: boolean,
) => {
  if (breakingCfg.format === "!" || typeof breaking === "boolean") {
    return "";
  }

  const emojiStr = emojiEnabled ? `${emojiCfg.breaking} ` : "";

  return breaking ? `\n\nBREAKING CHANGE: ${emojiStr}${breaking}` : "";
};

const createIssues = (
  issues: string[],
  { emoji: emojiCfg, issues: issuesCfg }: ResolvedConfig,
  emojiEnabled: boolean,
) => {
  if (issues.length === 0) return "";

  const isJira = issuesCfg.pattern === "jira";
  const defaultPrefix = issuesCfg.prefix ?? "closes";

  const formatted = issues
    .map((issue) => {
      return isJira
        ? parseJiraIssue(issue)
        : parseGithubIssue(issue, defaultPrefix);
    })
    .filter(Boolean)
    .join(", ");

  if (!formatted) return "";

  const emojiStr = emojiEnabled ? `${emojiCfg.issues} ` : "";

  return `\n\n${emojiStr}${formatted}`;
};

const createCoAuthors = (coAuthors: string[] | undefined) => {
  if (!coAuthors || coAuthors.length === 0) return "";

  return coAuthors.map((author) => `\n\nCo-authored-by: ${author}`).join("");
};

const createScope = (scope: string) => {
  return scope && scope !== "none" ? `(${scope})` : "";
};

const createHead = (
  parts: MessageParts,
  scope: string,
  config: ResolvedConfig,
  emojiPrefix: string,
) => {
  const breakingIndicator =
    config.breaking.format !== "footer" && parts.breaking ? "!" : "";

  return `${parts.type + scope}${breakingIndicator}: ${emojiPrefix}${parts.subject}`;
};

export const wrap = (string: string, maxWidth = MAX_WIDTH) => {
  const regex = new RegExp(
    String.raw`(?![^\n]{1,${maxWidth.toString()}}$)([^\n]{1,${maxWidth.toString()}})\s`,
    "g",
  );

  return string.replaceAll(regex, "$1\n");
};

const isEmojiEnabled = (config: ResolvedConfig, emojiOverride: boolean) => {
  if (process.env.GITZY_NO_EMOJI === "1") return false;

  return config.emoji.enabled && emojiOverride;
};

/**
 * Format message parts into a conventional commit message
 *
 * @param config - Resolved configuration for formatting
 *
 * @param parts - The message data (type, scope, subject, etc)
 *
 * @param emoji - Whether to include emojis (can override config)
 *
 * @returns Formatted commit message string
 */
export const formatMessage = (
  config: ResolvedConfig,
  parts: MessageParts,
  emoji: boolean,
) => {
  const typeEntry = config.types.find((t) => t.name === parts.type);
  const emojiEnabled = isEmojiEnabled(config, emoji);
  const emojiPrefix =
    emojiEnabled && typeEntry?.emoji ? `${typeEntry.emoji} ` : "";
  const scope = createScope(parts.scope);
  const head = createHead(parts, scope, config, emojiPrefix);
  const body = parts.body.trim() ? `\n\n${parts.body}` : "";
  const breaking = createBreaking(parts.breaking, config, emojiEnabled);
  const issues = createIssues(parts.issues, config, emojiEnabled);
  const coAuthors = createCoAuthors(parts.coAuthors);
  const maxWidth = Math.max(config.header.max, MAX_WIDTH);

  return wrap(`${head}${body}${breaking}${issues}${coAuthors}`, maxWidth);
};

/**
 * Structured result for --json output
 */
interface CommitResult {
  body: string;
  footer: string;
  header: string;
  message: string;
  parts: MessageParts;
}

const FOOTER_START_REGEX = /^(?:BREAKING CHANGE:|Co-authored-by:|🏁|💥)/i;

/**
 * Format message parts into a structured commit result
 *
 * @param config - Resolved configuration for formatting
 *
 * @param parts - The message data (type, scope, subject, etc)
 *
 * @param emoji - Whether to include emojis (can override config)
 *
 * @returns Structured commit result with message, header, body, footer, and parts
 */
export const formatMessageResult = (
  config: ResolvedConfig,
  parts: MessageParts,
  emoji: boolean,
): CommitResult => {
  const message = formatMessage(config, parts, emoji);
  const sections = message.split(/\n\n/);
  const header = sections[0] ?? "";

  let body = "";
  let footer = "";

  if (sections.length === 1) {
    // header only — nothing to do
  } else {
    // Scan from the end to find the contiguous footer block
    let footerStart = sections.length;

    for (let i = sections.length - 1; i >= 1; i--) {
      const section = sections[i] ?? "";

      if (FOOTER_START_REGEX.test(section)) {
        footerStart = i;
      } else {
        break;
      }
    }

    if (footerStart === 1) {
      // Everything after header is footer (no body)
      footer = sections.slice(1).join("\n\n");
    } else {
      // sections[1..footerStart-1] are body, sections[footerStart..] are footer
      body = sections.slice(1, footerStart).join("\n\n");
      footer = sections.slice(footerStart).join("\n\n");
    }
  }

  return { body, footer, header, message, parts };
};
