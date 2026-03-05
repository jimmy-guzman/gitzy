export interface BranchConfig {
  checkout: boolean;
  max: number;
  pattern: string;
  separator: string;
}

export interface BreakingConfig {
  format: "!" | "both" | "footer";
}

export interface EmojiConfig {
  breaking: string;
  enabled: boolean;
  issues: string;
}

export interface HeaderConfig {
  max: number;
  min: number;
}

export interface IssuesConfig {
  hint?: string;
  pattern: "github" | "jira";
  prefix?: string;
}

export interface ScopeEntry {
  description?: string;
  name: string;
}

export interface TypeEntry {
  description?: string;
  emoji?: string;
  name: string;
}

export interface Config {
  branch?: Partial<BranchConfig>;
  breaking?: Partial<BreakingConfig>;
  emoji?: Partial<EmojiConfig>;
  header?: Partial<HeaderConfig>;
  issues?: Partial<IssuesConfig>;
  prompts?: readonly string[];
  scopes?: readonly (ScopeEntry | string)[];
  types?: readonly (string | TypeEntry)[];
}

export interface ResolvedConfig {
  branch: BranchConfig;
  breaking: BreakingConfig;
  emoji: EmojiConfig;
  header: HeaderConfig;
  issues: IssuesConfig;
  prompts: readonly string[];
  scopes: readonly ScopeEntry[];
  types: readonly TypeEntry[];
}
