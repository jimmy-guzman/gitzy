import { autocomplete, isCancel } from "@clack/prompts";

import type { Config } from "@/config/gitzy-schema";
import type { Flags } from "@/interfaces";

export const choice = (config: Config, type: string, flags?: Flags) => {
  const typeDetails = config.details[type];
  const hasEmoji = typeDetails.emoji && !config.disableEmoji && flags?.emoji;
  const prefix = hasEmoji ? `${typeDetails.emoji} ` : "";

  return {
    hint: typeDetails.description.toLowerCase(),
    label: `${prefix}${type}`,
    value: type,
  };
};

export const type = async (options: { config: Config; flags: Flags }) => {
  const choices = options.config.types.map((configType) => {
    return choice(options.config, configType, options.flags);
  });

  const result = await autocomplete({
    maxItems: 10,
    message: "Type of change?",
    options: choices.map((choice) => {
      return {
        hint: choice.hint,
        label: choice.label,
        value: choice.value,
      };
    }),
    placeholder: "Select a type",
  });

  if (isCancel(result)) {
    process.exit(0);
  }

  return result;
};
