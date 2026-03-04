/**
 * Config resolution - loads gitzy config, auto-merges commitlint config if present,
 * and normalizes to a fully resolved config
 */

import { extractCommitlintRules } from "./commitlint";
import { CommitlintConfigSchema } from "./commitlint-schema";
import { loadConfig } from "./loader";
import { normalizeConfig } from "./normalizer";
import { ConfigSchema } from "./schema";

export const resolveConfig = async () => {
  const config = await loadConfig("gitzy", ConfigSchema);
  const commitlintConfig = await loadConfig(
    "commitlint",
    CommitlintConfigSchema,
  );

  if (commitlintConfig) {
    const overrides = extractCommitlintRules(commitlintConfig);
    const merged = config ? { ...config, ...overrides } : overrides;

    return normalizeConfig(merged);
  }

  return normalizeConfig(config);
};
