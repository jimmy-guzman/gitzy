import { styleText } from "node:util";

import type { CreatedPromptOptions } from "@/interfaces";

export const breaking = (options: CreatedPromptOptions) => {
  if (options.config.breakingChangeFormat === "!") {
    return {
      message: "Is this a breaking change?",
      name: "breaking",
      type: "confirm" as const,
    };
  }

  return {
    hint: styleText("dim", "...skip when none"),
    message: `${styleText("bold", "Add any breaking changes")}\n  ${styleText("red", "BREAKING CHANGE:")}`,
    name: "breaking",
    type: "text" as const,
  };
};
