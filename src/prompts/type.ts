import type {
  CreatedPrompt,
  EnquirerChoice,
  Flags,
  GitzyConfig,
} from "../interfaces";
import { fuzzySearch } from "../utils";
import { promptsLang } from "./lang";

export const choice = (
  { details, disableEmoji }: GitzyConfig,
  type: string,
  flags?: Flags,
): EnquirerChoice => {
  const {
    [type]: { description, emoji },
  } = details;
  const hasEmoji = emoji && !disableEmoji && flags?.emoji;
  const prefix = hasEmoji ? `${emoji} ` : "";

  return {
    title: `${type === "refactor" && hasEmoji ? `${prefix} ` : prefix}${type}:`,
    hint: description.toLowerCase(),
    indent: " ",
    value: type,
  };
};

export const type: CreatedPrompt = ({ config, flags }) => {
  const choices = config.types.map((configType) => {
    return choice(config, configType, flags);
  });

  return {
    choices,
    hint: promptsLang.type.hint,
    limit: 10,
    message: promptsLang.type.message,
    name: "type",
    suggest: (input: string): Promise<EnquirerChoice[]> => {
      return fuzzySearch<EnquirerChoice>(choices, input, "title");
    },
    type: "autocomplete",
  };
};
