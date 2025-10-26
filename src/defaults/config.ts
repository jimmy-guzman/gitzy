import type { GitzyConfig } from "@/interfaces";

import { details } from "./details";

export const questions = [
  "type",
  "scope",
  "subject",
  "body",
  "breaking",
  "issues",
] as const;

export type GitzyPrompts = (typeof questions)[number];

export const defaultConfig: GitzyConfig = {
  breakingChangeEmoji: "💥",
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
};

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

/**
 * Issues prefixes supported by GitHub for linking pull requests to issues.
 *
 * @see https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
 */
export type IssuesPrefixes = (typeof validIssuesPrefixes)[number];
