import type { CreatedPromptOptions } from "@/interfaces";

import { promptsLang } from "./lang";

export const breaking = (options: CreatedPromptOptions) => {
  if (options.config.breakingChangeFormat === "!") {
    return {
      message: "Is this a breaking change?",
      name: "breaking",
      type: "confirm" as const,
    };
  }

  return {
    hint: promptsLang.breaking.hint,
    message: promptsLang.breaking.message,
    name: "breaking",
    type: "text" as const,
  };
};
