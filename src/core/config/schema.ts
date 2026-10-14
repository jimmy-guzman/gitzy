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
      max: optional(number()),
      min: optional(number()),
    })
  ),
  branch: optional(
    object({
      checkout: optional(boolean()),
      max: optional(number()),
      pattern: optional(string()),
    })
  ),
  breaking: optional(
    object({
      format: optional(picklist(["!", "both", "footer"] as const)),
    })
  ),
  emoji: optional(
    object({
      breaking: optional(string()),
      enabled: optional(boolean()),
      issues: optional(string()),
    })
  ),
  header: optional(
    object({
      max: optional(number()),
      min: optional(number()),
    })
  ),
  issues: optional(
    object({
      hint: optional(string()),
      pattern: optional(picklist(["github", "jira"] as const)),
      prefix: optional(string()),
    })
  ),
  prompts: pipe(optional(array(string())), readonly()),
  scopes: pipe(optional(array(scopeSchema)), readonly()),
  types: pipe(optional(array(typeSchema)), readonly()),
});
