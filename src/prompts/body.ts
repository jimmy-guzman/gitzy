import type { CreatedPromptOptions } from "../interfaces";

import { promptsLang } from "./lang";

export const body = (_options: CreatedPromptOptions) => {
  return {
    format: (value: string) => {
      return value.trim();
    },
    hint: promptsLang.body.hint,
    message: promptsLang.body.message,
    multiline: true,
    name: "body",
    type: "text" as const,
  };
};
