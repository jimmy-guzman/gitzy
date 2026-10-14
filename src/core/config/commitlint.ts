/**
 * Helpers for loading and parsing commitlint configuration
 */

import type { CommitlintConfig } from "./commitlint-schema";
import type { Config } from "./types";

const toRange = (max: number | undefined, min: number | undefined) =>
  max === undefined && min === undefined
    ? undefined
    : {
        ...(max === undefined ? {} : { max }),
        ...(min === undefined ? {} : { min }),
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
