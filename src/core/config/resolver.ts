/**
 * Config resolution - loads gitzy config, auto-merges commitlint config if present,
 * and normalizes to a fully resolved config
 *
 * Merge semantics — gitzy config takes precedence over commitlint:
 * - Nested sections (branch, breaking, emoji, header, issues) are shallow-merged
 *   key-by-key so gitzy values win on a per-key basis.
 * - `types` and `scopes` are replaced wholesale: if the gitzy config defines
 *   either array it is used as-is and the commitlint value is discarded.
 *   To inherit commitlint types/scopes, omit them from the gitzy config.
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
  const [config, commitlintConfig] = await Promise.all([
    loadConfig("gitzy", ConfigSchema),
    loadConfig("commitlint", CommitlintConfigSchema),
  ]);

  if (commitlintConfig) {
    const commitlintOverrides = extractCommitlintRules(commitlintConfig);

    return normalizeConfig(mergeConfigs(commitlintOverrides, config ?? {}));
  }

  return normalizeConfig(config);
};
