/**
 * Config resolution - loads gitzy config, merges with commitlint config if enabled
 */

import { extractCommitlintRules } from "./commitlint";
import { CommitlintConfigSchema } from "./commitlint-schema";
import { loadConfig } from "./loader";
import { ConfigSchema } from "./schema";

export const resolveConfig = async (useCommitlint?: boolean) => {
  const config = await loadConfig("gitzy", ConfigSchema);
  const shouldUseCommitlint = useCommitlint ?? config?.useCommitlintConfig;

  if (shouldUseCommitlint) {
    const commitlintConfig = await loadConfig(
      "commitlint",
      CommitlintConfigSchema,
    );

    if (commitlintConfig) {
      const overrides = extractCommitlintRules(commitlintConfig);

      return config ? { ...config, ...overrides } : overrides;
    }
  }

  return config ?? null;
};
