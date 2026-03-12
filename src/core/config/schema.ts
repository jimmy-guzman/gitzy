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
  builtinTypes,
  defaultBodyConfig,
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
  body: optional(
    object({
      max: optional(number(), defaultBodyConfig.max),
      min: optional(number(), defaultBodyConfig.min),
    }),
  ),
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
      hint: optional(string(), defaultIssuesConfig.hint),
      pattern: optional(
        picklist(["github", "jira"] as const),
        defaultIssuesConfig.pattern,
      ),
      prefix: optional(string(), defaultIssuesConfig.prefix),
    }),
  ),
  prompts: pipe(optional(array(string()), [...defaultPrompts]), readonly()),
  scopes: pipe(optional(array(scopeSchema), []), readonly()),
  types: pipe(
    optional(
      array(typeSchema),
      builtinTypes.map((t) => t.name),
    ),
    readonly(),
  ),
});
