import type { Config } from "./types";

/**
 * Default emojis for each type based on https://gitmoji.dev/
 * - except for refactor due to its narrower rendering in most terminals
 */
const defaultTypeDetails = {
  chore: {
    description: "Other changes that don't modify src or test files",
    emoji: "🤖",
  },
  ci: {
    description: "Changes to CI configuration files and scripts",
    emoji: "👷",
  },
  docs: {
    description: "Add or update documentation",
    emoji: "📝",
  },
  feat: {
    description: "A new feature",
    emoji: "✨",
  },
  fix: {
    description: "Fix a bug",
    emoji: "🐛",
  },
  perf: {
    description: "Improve performance",
    emoji: "⚡️",
  },
  refactor: {
    description: "Refactor code",
    emoji: "🔄",
  },
  release: {
    description: "Deploy stuff",
    emoji: "🚀",
  },
  revert: {
    description: "Revert changes",
    emoji: "⏪",
  },
  style: {
    description: "Improve structure / format of the code",
    emoji: "🎨",
  },
  test: {
    description: "Add or update tests",
    emoji: "✅",
  },
} as const;

export const defaultQuestions = [
  "type",
  "scope",
  "subject",
  "body",
  "breaking",
  "issues",
] as const;

export const validIssuesPrefixes = [
  "close",
  "closes",
  "closed",
  "fix",
  "fixes",
  "fixed",
  "resolve",
  "resolves",
  "resolved",
] as const;

export const validBreakingChangeFormats = ["!", "footer", "both"] as const;

export const defaultConfig: Config = {
  breakingChangeEmoji: "💥",
  breakingChangeFormat: "footer",
  closedIssueEmoji: "🏁",
  details: defaultTypeDetails,
  disableEmoji: false,
  headerMaxLength: 64,
  headerMinLength: 3,
  issuesHint: "#123, #456, resolves #789, org/repo#100",
  issuesPrefix: "closes",
  questions: defaultQuestions,
  scopes: [],
  types: [
    "chore",
    "docs",
    "feat",
    "fix",
    "refactor",
    "test",
    "style",
    "ci",
    "perf",
    "revert",
    "release",
  ],
  useCommitlintConfig: false,
};
