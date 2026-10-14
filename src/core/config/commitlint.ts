/**
 * Helpers for loading and parsing commitlint configuration
 */

import type { GenericSchema } from "valibot";
import { array, is, number, string } from "valibot";

import type { CommitlintConfig } from "./commitlint-schema";
import type { BodyConfig, Config } from "./types";

const toRange = (max: number | undefined, min: number | undefined) => {
  if (max === undefined && min === undefined) {
    return null;
  }

  const range: Partial<BodyConfig> = {};

  if (max !== undefined) {
    range.max = max;
  }

  if (min !== undefined) {
    range.min = min;
  }

  return range;
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
