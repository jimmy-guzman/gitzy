import type { Config } from "./schema";

import { loadCommitlintConfig } from "./commitlint";
import { loadConfig } from "./loader";
import { validateUserConfig } from "./validate";

export const loadUserConfig = async (commitlint?: boolean) => {
  const loaded = await loadConfig<Config>("gitzy");

  if (commitlint && !loaded) {
    return loadCommitlintConfig();
  }

  if (loaded) {
    const isValid = await validateUserConfig(loaded.config);

    if (isValid) {
      if (loaded.config.useCommitlintConfig || commitlint) {
        const commitlintConfig = await loadCommitlintConfig();

        return { ...loaded.config, ...commitlintConfig };
      }

      return { ...loaded.config };
    }
  }

  return null;
};
