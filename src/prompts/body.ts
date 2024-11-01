import type { CreatedPrompt } from "../interfaces";

import { promptsLang } from "./lang";

export const body: CreatedPrompt = () => {
  return {
    format: (value): string => {
      return value.trim();
    },
    hint: promptsLang.body.hint,
    message: promptsLang.body.message,
    multiline: true,
    name: "body",
    type: "text",
  };
};
