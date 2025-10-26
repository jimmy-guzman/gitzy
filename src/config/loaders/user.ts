import type { GitzyConfig } from "@/interfaces";

import { validateUserConfig } from "../validation/validate";
import { loadCommitlintConfig } from "./commitlint";
import { loadConfig } from "./loader";

export const loadUserConfig = async (commitlint?: boolean) => {
  const loaded = await loadConfig<GitzyConfig>("gitzy");

  if (commitlint && !loaded) {
    return loadCommitlintConfig() as Promise<GitzyConfig>;
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
