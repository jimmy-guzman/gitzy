import type { CommitFlags, CreatedPromptOptions } from "@/cli/types";
import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";
import type { ResolvedConfig } from "@/core/config/types";

export const createTypeOptions = (
  config: ResolvedConfig,
  flags?: CommitFlags
) =>
  config.types.map((typeEntry) => {
    const hasEmoji =
      typeEntry.emoji !== undefined &&
      typeEntry.emoji !== "" &&
      config.emoji.enabled &&
      (flags?.emoji ?? true);
    const prefix = hasEmoji ? `${typeEntry.emoji} ` : "";

    return {
      hint: typeEntry.description,
      label: `${prefix}${typeEntry.name}`,
      value: typeEntry.name,
    };
  });

export const type =
  ({ autofill, config, flags, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.type !== undefined) {
      return autofill.type;
    }

    const options = createTypeOptions(config, flags);

    return await prompter.autocomplete({
      filter: createFuzzyFilter(options),
      initialValue: initial?.type,
      maxItems: 10,
      message: "Choose the type",
      options,
    });
  };
