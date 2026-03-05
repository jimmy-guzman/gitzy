import type {
  BranchConfig,
  BreakingConfig,
  EmojiConfig,
  HeaderConfig,
  IssuesConfig,
  ResolvedConfig,
  TypeEntry,
} from "./types";

export const defaultPrompts = [
  "type",
  "scope",
  "subject",
  "body",
  "breaking",
  "issues",
  "coAuthors",
] as const;

export type PromptName = (typeof defaultPrompts)[number];

/**
 * Built-in type defaults based on https://gitmoji.dev/
 * - except for refactor due to its narrower rendering in most terminals
 */
export const builtinTypes: readonly TypeEntry[] = [
  {
    description: "Other changes that don't modify src or test files",
    emoji: "🤖",
    name: "chore",
  },
  {
    description: "Changes to CI configuration files and scripts",
    emoji: "👷",
    name: "ci",
  },
  { description: "Add or update documentation", emoji: "📝", name: "docs" },
  { description: "A new feature", emoji: "✨", name: "feat" },
  { description: "Fix a bug", emoji: "🐛", name: "fix" },
  { description: "Improve performance", emoji: "⚡️", name: "perf" },
  { description: "Refactor code", emoji: "🔄", name: "refactor" },
  { description: "Deploy stuff", emoji: "🚀", name: "release" },
  { description: "Revert changes", emoji: "⏪", name: "revert" },
  {
    description: "Improve structure / format of the code",
    emoji: "🎨",
    name: "style",
  },
  { description: "Add or update tests", emoji: "✅", name: "test" },
];

export const defaultHeaderConfig: HeaderConfig = {
  max: 64,
  min: 3,
};

export const defaultEmojiConfig: EmojiConfig = {
  breaking: "💥",
  enabled: true,
  issues: "🏁",
};

export const defaultBreakingConfig: BreakingConfig = {
  format: "footer",
};

export const defaultIssuesConfig: IssuesConfig = {
  hint: "#123, #456, resolves #789, org/repo#100",
  pattern: "github",
  prefix: "closes",
};

export const defaultBranchConfig: BranchConfig = {
  checkout: true,
  max: 60,
  pattern: "{type}/{scope}/{issue}-{subject}",
  separator: "/",
};

export const defaultResolvedConfig: ResolvedConfig = {
  branch: defaultBranchConfig,
  breaking: defaultBreakingConfig,
  emoji: defaultEmojiConfig,
  header: defaultHeaderConfig,
  issues: defaultIssuesConfig,
  prompts: defaultPrompts,
  scopes: [],
  types: builtinTypes,
};
