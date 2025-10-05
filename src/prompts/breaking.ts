import type { CreatedPromptOptions } from "../interfaces";

import { promptsLang } from "./lang";

export const breaking = (_options: CreatedPromptOptions) => {
  return {
    hint: promptsLang.breaking.hint,
    message: promptsLang.breaking.message,
    name: "breaking",
    type: "text" as const,
  };
};
