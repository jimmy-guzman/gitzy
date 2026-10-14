import type { CreatedPromptOptions } from "@/cli/types";
import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";
import type { ResolvedConfig } from "@/core/config/types";
import { isEmojiEnabled } from "@/core/conventional/message";

export const createTypeOptions = (config: ResolvedConfig, emoji = true) => {
  const emojiEnabled = isEmojiEnabled(config, emoji);

  return config.types.map((typeEntry) => {
    const prefix =
      emojiEnabled && typeEntry.emoji !== undefined && typeEntry.emoji !== ""
        ? `${typeEntry.emoji} `
        : "";

    return {
      hint: typeEntry.description,
      label: `${prefix}${typeEntry.name}`,
      value: typeEntry.name,
    };
  });
};

export const type =
  ({ autofill, config, flags, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.type !== undefined) {
      return autofill.type;
    }

    const options = createTypeOptions(config, flags.emoji);

    return await prompter.autocomplete({
      filter: createFuzzyFilter(options),
      initialValue: initial?.type,
      maxItems: 10,
      message: "Choose the type",
      options,
    });
  };
