/**
 * Helpers for loading and parsing commitlint configuration
 */

import type { CommitlintConfig } from "./commitlint-schema";
import type { BodyConfig, Config } from "./types";

const toRange = (max: number | undefined, min: number | undefined) => {
  if (max === undefined && min === undefined) {
    return;
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

export const extractCommitlintRules = (
  config: CommitlintConfig
): Partial<Config> => {
  const rules = config.rules ?? {};
  const body = toRange(
    rules["body-max-length"]?.[2],
    rules["body-min-length"]?.[2]
  );
  const header = toRange(
    rules["header-max-length"]?.[2],
    rules["header-min-length"]?.[2]
  );
  const types = rules["type-enum"]?.[2];
  const scopes = rules["scope-enum"]?.[2];

  return {
    ...(body && { body }),
    ...(header && { header }),
    ...(types && { types }),
    ...(scopes && { scopes }),
  };
};
