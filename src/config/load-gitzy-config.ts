import { CommitlintConfigSchema } from "./commitlint-schema";
import { ConfigSchema } from "./gitzy-schema";
import { extractCommitlintRules } from "./helpers";
import { loadConfig } from "./load-config";

export const loadGitzyConfig = async (commitlint?: boolean) => {
  const config = await loadConfig("gitzy", ConfigSchema);
  const shouldUseCommitlint = commitlint ?? config?.useCommitlintConfig;

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
