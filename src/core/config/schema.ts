import {
  array,
  boolean,
  number,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  string,
  union,
} from "valibot";

import {
  defaultBranchConfig,
  defaultBreakingConfig,
  defaultEmojiConfig,
  defaultHeaderConfig,
  defaultIssuesConfig,
  defaultPrompts,
} from "./defaults";

const typeEntrySchema = object({
  description: optional(string()),
  emoji: optional(string()),
  name: string(),
});

const scopeEntrySchema = object({
  description: optional(string()),
  name: string(),
});

const typeSchema = union([string(), typeEntrySchema]);
const scopeSchema = union([string(), scopeEntrySchema]);

export const ConfigSchema = object({
  branch: optional(
    object({
      checkout: optional(boolean(), defaultBranchConfig.checkout),
      max: optional(number(), defaultBranchConfig.max),
      pattern: optional(string(), defaultBranchConfig.pattern),
      separator: optional(string(), defaultBranchConfig.separator),
    }),
  ),
  breaking: optional(
    object({
      format: optional(
        picklist(["!", "both", "footer"] as const),
        defaultBreakingConfig.format,
      ),
    }),
  ),
  emoji: optional(
    object({
      breaking: optional(string(), defaultEmojiConfig.breaking),
      enabled: optional(boolean(), defaultEmojiConfig.enabled),
      issues: optional(string(), defaultEmojiConfig.issues),
    }),
  ),
  header: optional(
    object({
      max: optional(number(), defaultHeaderConfig.max),
      min: optional(number(), defaultHeaderConfig.min),
    }),
  ),
  issues: optional(
    object({
      hint: optional(string()),
      pattern: optional(
        picklist(["github", "jira"] as const),
        defaultIssuesConfig.pattern,
      ),
      prefix: optional(string()),
    }),
  ),
  prompts: pipe(optional(array(string()), [...defaultPrompts]), readonly()),
  scopes: pipe(optional(array(scopeSchema), []), readonly()),
  types: pipe(
    optional(array(typeSchema), [
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
    ]),
    readonly(),
  ),
});
