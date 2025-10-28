import type { CommitlintConfig } from "./commitlint-schema";

export const extractCommitlintRules = (config: CommitlintConfig) => {
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
