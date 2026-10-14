import type { InferOutput } from "valibot";
import { array, object, optional, unknown } from "valibot";

const RuleSchema = array(unknown());

export const CommitlintConfigSchema = object({
  rules: optional(
    object({
      "body-max-length": optional(RuleSchema),
      "body-min-length": optional(RuleSchema),
      "header-max-length": optional(RuleSchema),
      "header-min-length": optional(RuleSchema),
      "scope-enum": optional(RuleSchema),
      "type-enum": optional(RuleSchema),
    })
  ),
});

export type CommitlintConfig = InferOutput<typeof CommitlintConfigSchema>;
