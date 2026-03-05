/**
 * Config resolution - loads gitzy config, auto-merges commitlint config if present,
 * and normalizes to a fully resolved config
 */

import type { Config } from "./types";

import { extractCommitlintRules } from "./commitlint";
import { CommitlintConfigSchema } from "./commitlint-schema";
import { loadConfig } from "./loader";
import { normalizeConfig } from "./normalizer";
import { ConfigSchema } from "./schema";

const mergeConfigs = (base: Config | null, overrides: Config): Config => {
  if (!base) return overrides;

  return {
    ...base,
    ...overrides,
    branch:
      (base.branch ?? overrides.branch)
        ? { ...base.branch, ...overrides.branch }
        : undefined,
    breaking:
      (base.breaking ?? overrides.breaking)
        ? { ...base.breaking, ...overrides.breaking }
        : undefined,
    emoji:
      (base.emoji ?? overrides.emoji)
        ? { ...base.emoji, ...overrides.emoji }
        : undefined,
    header:
      (base.header ?? overrides.header)
        ? { ...base.header, ...overrides.header }
        : undefined,
    issues:
      (base.issues ?? overrides.issues)
        ? { ...base.issues, ...overrides.issues }
        : undefined,
  };
};

export const resolveConfig = async () => {
  const config = await loadConfig("gitzy", ConfigSchema);
  const commitlintConfig = await loadConfig(
    "commitlint",
    CommitlintConfigSchema,
  );

  if (commitlintConfig) {
    const commitlintOverrides = extractCommitlintRules(commitlintConfig);

    return normalizeConfig(mergeConfigs(commitlintOverrides, config ?? {}));
  }

  return normalizeConfig(config);
};
