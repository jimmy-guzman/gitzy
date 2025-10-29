import type { Config } from "@/config/gitzy-schema";
import type { Flags } from "@/interfaces";

import { fuzzySearch } from "@/lib/fuzzy-search";

import { promptsLang } from "./lang";

export const choice = (config: Config, type: string, flags?: Flags) => {
  const typeDetails = config.details[type];
  const hasEmoji = typeDetails.emoji && !config.disableEmoji && flags?.emoji;
  const prefix = hasEmoji ? `${typeDetails.emoji} ` : "";

  return {
    hint: typeDetails.description.toLowerCase(),
    indent: " ",
    title: `${prefix}${type}:`,
    value: type,
  };
};

export const type = ({ config, flags }: { config: Config; flags?: Flags }) => {
  const choices = config.types.map((configType) => {
    return choice(config, configType, flags);
  });

  return {
    choices,
    hint: promptsLang.type.hint,
    limit: 10,
    message: promptsLang.type.message,
    name: "type",
    suggest: (input: string) => {
      return fuzzySearch(choices, ["title", "hint"], input);
    },
    type: "autocomplete" as const,
  };
};
