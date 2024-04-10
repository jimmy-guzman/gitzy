interface PromptLang {
  hint?: string;
  message: string;
}

export type GitzyPrompts =
  | "body"
  | "breaking"
  | "issues"
  | "scope"
  | "subject"
  | "type";

export interface Detail {
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

/**
 * https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
 */
export type IssuesPrefixes =
  | "close"
  | "closed"
  | "closes"
  | "fix"
  | "fixed"
  | "fixes"
  | "resolve"
  | "resolved"
  | "resolves";

export interface GitzyConfig {
  breakingChangeEmoji: string;
  closedIssueEmoji: string;
  details: Details;
  disableEmoji: boolean;
  headerMaxLength: number;
  headerMinLength: number;
  /**
   * Allows you to customize the `issues` prompt hint
   * @default '#123'
   */
  issuesHint: string;
  /**
   * Allows you to choose the `issuesPrefix` based on [Github supported keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).
   * @default "closes"
   */
  issuesPrefix: IssuesPrefixes;
  questions: GitzyPrompts[];
  scopes: string[];
  types: string[];
  useCommitlintConfig: boolean;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EnquirerChoice = {
  hint?: string;
  indent?: string;
  title: string;
  value: string;
};

export interface EnquirerState {
  answers: Answers;
  input: string;
}
export interface EnquirerPrompt {
  choices?: EnquirerChoice[];
  footer?: (state: EnquirerState) => string;
  format?: (value: string) => string;
  hint?: string;
  message: string | ((state?: EnquirerState) => string);
  multiline?: boolean;
  name: string;
  skip?: boolean;
  suggest?: (input: string) => Promise<EnquirerChoice[]>;
  type: "autocomplete" | "input" | "text";
  validate?: (input: string, state?: EnquirerState) => string | true;
}

export interface Flags {
  body?: string;
  breaking?: string;
  commitlint?: boolean;
  dryRun?: boolean;
  emoji?: boolean;
  help?: boolean;
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

export type CreatedPrompt = ({
  answers,
  config,
  flags,
}: CreatedPromptOptions) => EnquirerPrompt | null;

export type UnknownObject = Record<string, unknown>;

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
