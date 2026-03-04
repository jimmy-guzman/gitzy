import type { CommitFlags, CreatedPromptOptions } from "@/cli/types";
import type { ResolvedConfig } from "@/core/config/types";

import { fuzzySearch } from "@/cli/utils/fuzzy-search";

import { AUTOCOMPLETE_HINT } from "./constants";

export const choice = (
  config: ResolvedConfig,
  typeName: string,
  flags?: CommitFlags,
) => {
  const typeEntry = config.types.find((t) => t.name === typeName);
  const hasEmoji =
    typeEntry?.emoji && config.emoji.enabled && (flags?.emoji ?? true);
  const prefix = hasEmoji ? `${typeEntry.emoji} ` : "";

  const title = `${prefix}${typeName}:`;

  return {
    hint: typeEntry?.description?.toLowerCase() ?? "",
    indent: " ",
    message: title,
    name: typeName,
    title,
    value: typeName,
  };
};

export const type = ({ config, flags, initial }: CreatedPromptOptions) => {
  const choices = config.types.map((typeEntry) => {
    return choice(config, typeEntry.name, flags);
  });

  return {
    choices,
    hint: AUTOCOMPLETE_HINT,
    ...(initial?.type === undefined ? {} : { initial: initial.type }),
    limit: 10,
    message: "Choose the type",
    name: "type",
    suggest: (input: string) => fuzzySearch(choices, ["title", "hint"], input),
    type: "autocomplete" as const,
  };
};
