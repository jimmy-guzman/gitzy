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

import { parse } from "valibot";

import { isString } from "@/core/guards";

import { CommitlintConfigSchema, extractCommitlintRules } from "./commitlint";
import { loadConfig } from "./loader";
import { normalizeConfig } from "./normalizer";
import { ConfigSchema, KeyTreeSchema, validateConfig } from "./schema";
import type { Config, ScopeEntry, TypeEntry } from "./types";

const toName = (entry: ScopeEntry | string | TypeEntry) =>
  isString(entry) ? entry : entry.name;

const constrainByName = <T extends ScopeEntry | string | TypeEntry>(
  gitzy: readonly T[],
  commitlint: readonly T[]
): readonly T[] => {
  const commitlintNames = new Set(commitlint.map(toName));
  const gitzyNames = new Set(gitzy.map(toName));
  const allowed = gitzy.filter((e) => commitlintNames.has(toName(e)));
  const extras = commitlint.filter((e) => !gitzyNames.has(toName(e)));

  return [...allowed, ...extras];
};

const mergeConfigs = (base: Config, overrides: Config): Config => ({
  ...base,
  ...overrides,
  body: { ...base.body, ...overrides.body },
  branch: { ...base.branch, ...overrides.branch },
  breaking: { ...base.breaking, ...overrides.breaking },
  emoji: { ...base.emoji, ...overrides.emoji },
  header: { ...base.header, ...overrides.header },
  issues: { ...base.issues, ...overrides.issues },
  scopes:
    base.scopes && overrides.scopes
      ? constrainByName(overrides.scopes, base.scopes)
      : (overrides.scopes ?? base.scopes),
  types:
    base.types && overrides.types
      ? constrainByName(overrides.types, base.types)
      : (overrides.types ?? base.types),
});

export const resolveConfig = async () => {
  const [gitzy, commitlint] = await Promise.all([
    loadConfig("gitzy", ConfigSchema),
    loadConfig("commitlint", CommitlintConfigSchema),
  ]);

  const config = normalizeConfig(
    commitlint
      ? mergeConfigs(
          extractCommitlintRules(commitlint.output),
          gitzy?.output ?? {}
        )
      : (gitzy?.output ?? null)
  );

  return {
    config,
    warnings: validateConfig(
      parse(KeyTreeSchema, gitzy?.input),
      gitzy?.output ?? {},
      config
    ),
  };
};
