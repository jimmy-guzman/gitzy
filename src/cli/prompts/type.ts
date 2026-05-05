import { autocomplete } from "@clack/prompts";

import type { CommitFlags, CreatedPromptOptions } from "@/cli/types";
import type { ResolvedConfig } from "@/core/config/types";

import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";

export const createTypeOptions = (
  config: ResolvedConfig,
  flags?: CommitFlags,
) => {
  return config.types.map((typeEntry) => {
    const hasEmoji =
      typeEntry.emoji && config.emoji.enabled && (flags?.emoji ?? true);
    const prefix = hasEmoji ? `${typeEntry.emoji} ` : "";

    return {
      hint: typeEntry.description?.toLowerCase(),
      label: `${prefix}${typeEntry.name}`,
      value: typeEntry.name,
    };
  });
};

export const type = ({
  autofill,
  config,
  flags,
  initial,
}: CreatedPromptOptions) => {
  return () => {
    if (autofill?.type !== undefined) return Promise.resolve(autofill.type);

    const options = createTypeOptions(config, flags);

    return autocomplete({
      filter: createFuzzyFilter(options),
      initialValue: initial?.type,
      maxItems: 10,
      message: "Choose the type",
      options,
    });
  };
};
