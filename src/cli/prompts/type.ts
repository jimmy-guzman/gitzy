import type { Flags } from "@/cli/types";
import type { Config } from "@/core/config/types";

import { fuzzySearch } from "@/cli/utils/fuzzy-search";

import { AUTOCOMPLETE_HINT } from "./constants";

export const choice = (config: Config, type: string, flags?: Flags) => {
  const typeDetails = Object.hasOwn(config.details, type)
    ? config.details[type]
    : undefined;
  const hasEmoji =
    typeDetails?.emoji && !config.disableEmoji && (flags?.emoji ?? true);
  const prefix = hasEmoji ? `${typeDetails.emoji} ` : "";

  return {
    hint: typeDetails?.description.toLowerCase() ?? "",
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
    hint: AUTOCOMPLETE_HINT,
    limit: 10,
    message: "Choose the type",
    name: "type",
    suggest: (input: string) => fuzzySearch(choices, ["title", "hint"], input),
    type: "autocomplete" as const,
  };
};
