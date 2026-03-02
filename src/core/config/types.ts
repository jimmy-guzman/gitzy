/**
 * Core configuration types for gitzy
 *
 * This represents the v6 config schema that will be kept for compatibility.
 * The config structure remains the same as v6 - just reorganized.
 */

export interface TypeDetail {
  description: string;
  emoji: string;
}

export interface Config {
  breakingChangeEmoji: string;
  breakingChangeFormat: "!" | "both" | "footer";
  closedIssueEmoji: string;
  details: Record<string, TypeDetail>;
  disableEmoji: boolean;
  headerMaxLength: number;
  headerMinLength: number;
  issuesHint: string;
  issuesPrefix:
    | "close"
    | "closed"
    | "closes"
    | "fix"
    | "fixed"
    | "fixes"
    | "resolve"
    | "resolved"
    | "resolves";
  questions: readonly (
    | "body"
    | "breaking"
    | "issues"
    | "scope"
    | "subject"
    | "type"
  )[];
  scopes: readonly string[];
  types: readonly string[];
  useCommitlintConfig: boolean;
}

export type Questions = Config["questions"];
export type Scopes = Config["scopes"];
