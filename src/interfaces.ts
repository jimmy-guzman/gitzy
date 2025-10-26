import type {
  BreakingChangeFormats,
  GitzyPrompts,
  IssuesPrefixes,
} from "./defaults/config";

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
  breaking: boolean | string;
  issues: string;
  scope: string;
  subject: string;
  type: string;
}

export interface GitzyConfig {
  breakingChangeEmoji: string;
  /**
   * Allows you to customize the format of the breaking change indicator and prompts behavior.
   *
   * - `"!"`: Append `!` to the type/scope in the header and simply ask whether or not change is a breaking change
   * - `"footer"`: Prompt and add a `BREAKING CHANGE` footer (default)
   * - `"both"`: Prompt and add both an indicator and a footer
   *
   * @example
   * // "!" format - adds ! to header, prompts for yes/no
   * feat!: send an email to the customer when a product is shipped
   *
   * @example
   * // "footer" format - prompts for description, adds to footer
   * feat: allow provided config object to extend other configs
   *
   * BREAKING CHANGE: `extends` key in config file is now used for extending other config files
   *
   * @example
   * // "both" format - adds ! to header AND prompts for footer description
   * chore!: drop support for Node 6
   *
   * BREAKING CHANGE: use JavaScript features not available in Node 6.
   *
   * @see {@link https://www.conventionalcommits.org/en/v1.0.0/#specification | Conventional Commits Specification}
   *
   * @default "footer"
   */
  breakingChangeFormat: BreakingChangeFormats;
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
  breaking?: boolean | string;
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
