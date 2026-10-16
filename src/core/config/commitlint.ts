/**
 * Helpers for loading and parsing commitlint configuration
 */

import type { GenericSchema, InferOutput } from "valibot";
import { array, is, number, object, optional, string, unknown } from "valibot";

import type { Config } from "./types";

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

type CommitlintConfig = InferOutput<typeof CommitlintConfigSchema>;

const toRange = (max: number | undefined, min: number | undefined) =>
  max === undefined && min === undefined
    ? null
    : {
        ...(max !== undefined && { max }),
        ...(min !== undefined && { min }),
      };

const ruleValue = <T extends GenericSchema>(
  rule: unknown[] | undefined,
  schema: T
) => {
  const [severity, condition, value] = rule ?? [];

  return (severity === 1 || severity === 2) &&
    condition === "always" &&
    is(schema, value)
    ? value
    : undefined;
};

export const extractCommitlintRules = (
  config: CommitlintConfig
): Partial<Config> => {
  const rules = config.rules ?? {};
  const body = toRange(
    ruleValue(rules["body-max-length"], number()),
    ruleValue(rules["body-min-length"], number())
  );
  const header = toRange(
    ruleValue(rules["header-max-length"], number()),
    ruleValue(rules["header-min-length"], number())
  );
  const types = ruleValue(rules["type-enum"], array(string()));
  const scopes = ruleValue(rules["scope-enum"], array(string()));

  return {
    ...(body && { body }),
    ...(header && { header }),
    ...(types && { types }),
    ...(scopes && { scopes }),
  };
};
