/**
 * Helpers for loading and parsing commitlint configuration
 */

import type { CommitlintConfig } from "./commitlint-schema";
import type { Config } from "./types";

export const extractCommitlintRules = (
  config: CommitlintConfig,
): Partial<Config> => {
  const { rules } = config;
  const out: Partial<Config> = {};

  const bodyMax = rules?.["body-max-length"]?.[2];
  const bodyMin = rules?.["body-min-length"]?.[2];
  const headerMax = rules?.["header-max-length"]?.[2];
  const headerMin = rules?.["header-min-length"]?.[2];
  const types = rules?.["type-enum"]?.[2];
  const scopes = rules?.["scope-enum"]?.[2];

  if (bodyMax !== undefined || bodyMin !== undefined) {
    out.body = {
      ...(bodyMax === undefined ? {} : { max: bodyMax }),
      ...(bodyMin === undefined ? {} : { min: bodyMin }),
    };
  }

  if (headerMax !== undefined || headerMin !== undefined) {
    out.header = {
      ...(headerMax === undefined ? {} : { max: headerMax }),
      ...(headerMin === undefined ? {} : { min: headerMin }),
    };
  }

  if (types !== undefined) out.types = types;

  if (scopes !== undefined) out.scopes = scopes;

  return out;
};
