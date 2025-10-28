import type { InferOutput } from "valibot";

import { array, number, object, optional, string, tuple } from "valibot";

const HeaderLengthRuleSchema = tuple([number(), string(), number()]);

const ScopeCaseRuleSchema = tuple([number(), string(), string()]);

const ScopeEnumRuleSchema = tuple([number(), string(), array(string())]);

const TypeEnumRuleSchema = tuple([number(), string(), array(string())]);

export const CommitlintConfigSchema = object({
  rules: optional(
    object({
      "header-max-length": optional(HeaderLengthRuleSchema),
      "header-min-length": optional(HeaderLengthRuleSchema),
      "scope-case": optional(ScopeCaseRuleSchema),
      "scope-enum": optional(ScopeEnumRuleSchema),
      "type-enum": optional(TypeEnumRuleSchema),
    }),
  ),
});

export type CommitlintConfig = InferOutput<typeof CommitlintConfigSchema>;
