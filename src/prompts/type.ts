import type { Config } from "@/config/schema";
import type { Flags } from "@/interfaces";

import { fuzzySearch } from "@/lib/fuzzy-search";

import { promptsLang } from "./lang";

export const choice = (
  { details, disableEmoji }: Config,
  type: string,
  flags?: Flags,
) => {
  const {
    [type]: { description, emoji },
  } = details;
  const hasEmoji = emoji && !disableEmoji && flags?.emoji;
  const prefix = hasEmoji ? `${emoji} ` : "";

  return {
    hint: description.toLowerCase(),
    indent: " ",
    title: `${type === "refactor" && hasEmoji ? `${prefix} ` : prefix}${type}:`,
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
