import type { CreatedPromptOptions, Flags, GitzyConfig } from "../interfaces";

import { fuzzySearch } from "../utils";
import { promptsLang } from "./lang";

export const choice = (
  { details, disableEmoji }: GitzyConfig,
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

export const type = ({ config, flags }: CreatedPromptOptions) => {
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
