import { details } from "./details";

export const questions = [
  "type",
  "scope",
  "subject",
  "body",
  "breaking",
  "issues",
] as const;

export const defaultConfig = {
  breakingChangeEmoji: "💥",
  breakingChangeFormat: "footer",
  closedIssueEmoji: "🏁",
  details,
  disableEmoji: false,
  headerMaxLength: 64,
  headerMinLength: 3,
  issuesHint: "#123, #456, resolves #789, org/repo#100",
  issuesPrefix: "closes",
  questions,
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
} as const;

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
