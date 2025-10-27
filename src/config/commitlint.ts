import { loadConfig } from "./loader";
import { validateUserConfig } from "./validate";

interface CommitlintConfig {
  rules?: {
    "header-max-length"?: [number, string, number];
    "header-min-length"?: [number, string, number];
    "scope-case"?: [number, string, string];
    "scope-enum"?: [number, string, string[]];
    "type-enum"?: [number, string, string[]];
  };
}

export const getCommitlintOverrides = (config: CommitlintConfig) => {
  const headerMaxLength = config.rules?.["header-max-length"]?.[2];
  const headerMinLength = config.rules?.["header-min-length"]?.[2];
  const scopes = config.rules?.["scope-enum"]?.[2];
  const types = config.rules?.["type-enum"]?.[2];

  return {
    ...(headerMaxLength !== undefined && { headerMaxLength }),
    ...(headerMinLength !== undefined && { headerMinLength }),
    ...(scopes !== undefined && { scopes }),
    ...(types !== undefined && { types }),
  };
};

export const loadCommitlintConfig = async () => {
  const commitlint = await loadConfig<CommitlintConfig>("commitlint");

  if (commitlint) {
    const commitlintOverrides = getCommitlintOverrides(commitlint.config);

    await validateUserConfig(commitlintOverrides);

    return commitlintOverrides;
  }

  return null;
};
