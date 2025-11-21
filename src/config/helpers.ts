import type { CommitlintConfig } from "./commitlint-schema";

const RULES = {
  headerMaxLength: "header-max-length",
  headerMinLength: "header-min-length",
  scopes: "scope-enum",
  types: "type-enum",
} as const;

export const extractCommitlintRules = (config: CommitlintConfig) => {
  const { rules } = config;
  const out: Record<string, unknown> = {};

  for (const key in RULES) {
    const ruleName = RULES[key as keyof typeof RULES];
    const value = rules?.[ruleName]?.[2];

    if (value !== undefined) out[key] = value;
  }

  return out;
};
