import type { Config, ResolvedConfig, ScopeEntry, TypeEntry } from "./types";

import {
  builtinTypes,
  defaultBranchConfig,
  defaultBreakingConfig,
  defaultEmojiConfig,
  defaultHeaderConfig,
  defaultIssuesConfig,
  defaultPrompts,
} from "./defaults";

const builtinTypeMap = new Map(builtinTypes.map((t) => [t.name, t]));

const resolveTypeEntry = (entry: string | TypeEntry): TypeEntry => {
  if (typeof entry === "string") {
    const builtin = builtinTypeMap.get(entry);

    return builtin ?? { name: entry };
  }

  const builtin = builtinTypeMap.get(entry.name);

  return {
    description: entry.description ?? builtin?.description,
    emoji: entry.emoji ?? builtin?.emoji,
    name: entry.name,
  };
};

const resolveScopeEntry = (entry: ScopeEntry | string): ScopeEntry => {
  if (typeof entry === "string") {
    return { name: entry };
  }

  return entry;
};

export const normalizeConfig = (config: Config | null): ResolvedConfig => {
  const types = (config?.types ?? builtinTypes.map((t) => t.name)).map(
    resolveTypeEntry,
  );
  const scopes = (config?.scopes ?? []).map(resolveScopeEntry);

  return {
    branch: {
      ...defaultBranchConfig,
      ...config?.branch,
    },
    breaking: {
      ...defaultBreakingConfig,
      ...config?.breaking,
    },
    emoji: {
      ...defaultEmojiConfig,
      ...config?.emoji,
    },
    header: {
      ...defaultHeaderConfig,
      ...config?.header,
    },
    issues: {
      ...defaultIssuesConfig,
      ...config?.issues,
    },
    prompts: config?.prompts ?? defaultPrompts,
    scopes,
    types,
  };
};
