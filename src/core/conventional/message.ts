/**
 * Conventional commit message formatting
 * Takes message parts and config, returns formatted commit message string
 */

import type { ResolvedConfig } from "@/core/config/types";
import { isString } from "@/core/guards";

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
  "iu"
);

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const parseGithubIssue = (issue: string, defaultPrefix: string) => {
  const trimmed = issue.trim();

  if (!trimmed) {
    return null;
  }

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
  emojiEnabled: boolean
) => {
  if (breakingCfg.format === "!" || !isString(breaking) || !breaking) {
    return "";
  }

  const emojiStr = emojiEnabled ? `${emojiCfg.breaking} ` : "";

  return `BREAKING CHANGE: ${emojiStr}${breaking}`;
};

const createIssues = (
  issues: string[],
  { emoji: emojiCfg, issues: issuesCfg }: ResolvedConfig,
  emojiEnabled: boolean
) => {
  const isJira = issuesCfg.pattern === "jira";
  const defaultPrefix = issuesCfg.prefix ?? "closes";

  const formatted = issues
    .map((issue) =>
      isJira ? parseJiraIssue(issue) : parseGithubIssue(issue, defaultPrefix)
    )
    .filter(Boolean)
    .join(", ");

  if (!formatted) {
    return "";
  }

  const emojiStr = emojiEnabled ? `${emojiCfg.issues} ` : "";

  return `${emojiStr}${formatted}`;
};

const createCoAuthors = (coAuthors: string[] = []) =>
  coAuthors.map((author) => `Co-authored-by: ${author}`).join("\n");

const createSignoff = (signoff: MessageParts["signoff"]) => {
  const trimmed = isString(signoff) ? signoff.trim() : "";

  return trimmed ? `Signed-off-by: ${trimmed}` : "";
};

const createScope = (scope: string) =>
  scope && scope !== "none" ? `(${scope})` : "";

const createHead = (
  parts: MessageParts,
  scope: string,
  config: ResolvedConfig,
  emojiPrefix: string
) => {
  const breakingIndicator =
    config.breaking.format !== "footer" &&
    parts.breaking !== false &&
    parts.breaking !== ""
      ? "!"
      : "";

  return `${parts.type + scope}${breakingIndicator}: ${emojiPrefix}${parts.subject}`;
};

export const wrap = (string: string, maxWidth = MAX_WIDTH) => {
  const regex = new RegExp(
    String.raw`(?![^\n]{1,${maxWidth.toString()}}$)([^\n]{1,${maxWidth.toString()}})\s`,
    "gu"
  );

  return string.replaceAll(regex, "$1\n");
};

const FENCE_REGEX = /^ {0,3}(?:(?<backtick>`{3,})[^`]*|(?<tilde>~{3,}).*)$/u;
const INDENTED_REGEX = /^(?: {4}|\t)/u;
const HANGING_INDENT_REGEX = /^ {0,3}(?:(?:[-*]|\d{1,9}\.)\s{1,4})?/u;

const wrapBody = (body: string, maxWidth: number) => {
  let fence = "";

  return body
    .split("\n")
    .map((line) => {
      const { backtick, tilde } = FENCE_REGEX.exec(line)?.groups ?? {};
      const delimiter = backtick ?? tilde ?? "";

      if (fence) {
        if (
          delimiter.length >= fence.length &&
          delimiter.startsWith(fence[0] ?? "") &&
          line.trim() === delimiter
        ) {
          fence = "";
        }

        return line;
      }

      if (delimiter) {
        fence = delimiter;

        return line;
      }

      if (INDENTED_REGEX.test(line)) {
        return line;
      }

      const [marker] = HANGING_INDENT_REGEX.exec(line) ?? [""];
      const indent = " ".repeat(marker.length);

      return wrap(line.slice(marker.length), maxWidth - marker.length)
        .split("\n")
        .map((part, index) => `${index === 0 ? marker : indent}${part}`)
        .join("\n");
    })
    .join("\n");
};

/**
 * Wrap a commit body to the message width, leaving code blocks untouched
 *
 * @param config - Resolved configuration
 *
 * @param body - Raw body text
 *
 * @returns The wrapped body, or an empty string when the body is blank
 */
export const formatBody = (config: ResolvedConfig, body: string) =>
  body.trim() ? wrapBody(body, Math.max(config.header.max, MAX_WIDTH)) : "";

/**
 * Whether emoji should be rendered, honoring `GITZY_NO_EMOJI`, the config, and the CLI override
 *
 * @param config - Resolved configuration
 *
 * @param emojiOverride - CLI emoji flag (`--no-emoji` sets it to false)
 *
 * @returns Whether emoji are enabled
 */
export const isEmojiEnabled = (
  config: ResolvedConfig,
  emojiOverride: boolean
) => {
  if (process.env.GITZY_NO_EMOJI === "1") {
    return false;
  }

  return config.emoji.enabled && emojiOverride;
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
  emoji: boolean
): CommitResult => {
  const typeEntry = config.types.find((t) => t.name === parts.type);
  const emojiEnabled = isEmojiEnabled(config, emoji);
  const emojiPrefix =
    emojiEnabled && typeEntry?.emoji !== undefined && typeEntry.emoji !== ""
      ? `${typeEntry.emoji} `
      : "";
  const maxWidth = Math.max(config.header.max, MAX_WIDTH);
  const header = wrap(
    createHead(parts, createScope(parts.scope), config, emojiPrefix),
    maxWidth
  );
  const body = formatBody(config, parts.body);
  const notes = wrap(
    [
      createBreaking(parts.breaking, config, emojiEnabled),
      createIssues(parts.issues, config, emojiEnabled),
    ]
      .filter(Boolean)
      .join("\n\n"),
    maxWidth
  );
  const trailers = [
    createCoAuthors(parts.coAuthors),
    createSignoff(parts.signoff),
  ]
    .filter(Boolean)
    .join("\n");
  const footer = [notes, trailers].filter(Boolean).join("\n\n");
  const message = [header, body, footer].filter(Boolean).join("\n\n");

  return { body, footer, header, message, parts };
};
