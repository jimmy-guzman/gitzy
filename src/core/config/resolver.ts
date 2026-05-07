/**
 * Config resolution - loads gitzy config, auto-merges commitlint config if present,
 * and normalizes to a fully resolved config
 *
 * Merge semantics — gitzy config takes precedence over commitlint:
 * - Nested sections (branch, breaking, emoji, header, issues) are shallow-merged
 *   key-by-key so gitzy values win on a per-key basis.
 * - `types` and `scopes` are constrained by commitlint when both configs define them:
 *   commitlint's enum is the authoritative allowed set. Gitzy entries whose names
 *   appear in the commitlint enum are kept first (in gitzy order, preserving gitzy
 *   metadata). Commitlint entries not present in gitzy are appended at the end.
 *   Gitzy entries NOT in the commitlint enum are excluded.
 */

import type { Config, ScopeEntry, TypeEntry } from "./types";

import { extractCommitlintRules } from "./commitlint";
import { CommitlintConfigSchema } from "./commitlint-schema";
import { loadConfig } from "./loader";
import { normalizeConfig } from "./normalizer";
import { ConfigSchema } from "./schema";

const toName = (entry: ScopeEntry | string | TypeEntry) => {
  return typeof entry === "string" ? entry : entry.name;
};

const constrainByName = <T extends ScopeEntry | string | TypeEntry>(
  gitzy: readonly T[],
  commitlint: readonly T[],
): readonly T[] => {
  const commitlintNames = new Set(commitlint.map(toName));
  const gitzyNames = new Set(gitzy.map(toName));
  const allowed = gitzy.filter((e) => commitlintNames.has(toName(e)));
  const extras = commitlint.filter((e) => !gitzyNames.has(toName(e)));

  return [...allowed, ...extras];
};

const mergeConfigs = (base: Config | null, overrides: Config): Config => {
  if (!base) return overrides;

  return {
    ...base,
    ...overrides,
    body:
      (base.body ?? overrides.body)
        ? { ...base.body, ...overrides.body }
        : undefined,
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
    scopes:
      base.scopes && overrides.scopes
        ? constrainByName(overrides.scopes, base.scopes)
        : (overrides.scopes ?? base.scopes),
    types:
      base.types && overrides.types
        ? constrainByName(overrides.types, base.types)
        : (overrides.types ?? base.types),
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
