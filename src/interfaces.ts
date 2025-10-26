import type { GitzyPrompts, IssuesPrefixes } from "./defaults/config";

interface PromptLang {
  hint?: string;
  message: string;
}

interface Detail {
  description: string;
  emoji: string;
}

export type Details = Record<string, Detail>;

export interface Answers {
  body: string;
  breaking: string;
  issues: string;
  scope: string;
  subject: string;
  type: string;
}

export interface GitzyConfig {
  breakingChangeEmoji: string;
  closedIssueEmoji: string;
  details: Details;
  disableEmoji: boolean;
  headerMaxLength: number;
  headerMinLength: number;
  /**
   * Allows you to customize the `issues` prompt hint
   *
   * @default '#123'
   */
  issuesHint: string;
  /**
   * Allows you to choose the `issuesPrefix` based on [Github supported keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).
   *
   * @default "closes"
   */
  issuesPrefix: IssuesPrefixes;
  questions: readonly GitzyPrompts[];
  scopes: string[];
  types: string[];
  useCommitlintConfig: boolean;
}

export interface EnquirerChoice {
  hint?: string;
  indent?: string;
  title: string;
  value: string;
}

export interface EnquirerState {
  answers: Answers;
  input: string;
}

export interface Flags {
  body?: string;
  breaking?: string;
  commitlint?: boolean;
  dryRun?: boolean;
  emoji?: boolean;
  help?: boolean;
  hook?: boolean;
  issues?: string;
  noEmoji?: boolean;
  passthrough?: string[];
  retry?: boolean;
  scope?: string;
  skip?: string[];
  subject?: string;
  type?: string;
  version?: boolean;
}

export interface CreatedPromptOptions {
  answers: Answers;
  config: GitzyConfig;
  flags: Flags;
}

export interface GitzyState {
  answers: Answers;
  config: GitzyConfig;
}

export interface PromptsLang {
  body: PromptLang;
  breaking: PromptLang;
  scope: PromptLang;
  subject: PromptLang;
  type: PromptLang;
}
