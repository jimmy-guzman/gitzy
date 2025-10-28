import type { CreatedPromptOptions } from "@/interfaces";

import { promptsLang } from "./lang";

export const body = (_options: CreatedPromptOptions) => {
  return {
    hint: promptsLang.body.hint,
    message: promptsLang.body.message,
    multiline: true,
    name: "body",
    result: (value: string) => {
      return value.trim();
    },
    type: "text" as const,
  };
};
