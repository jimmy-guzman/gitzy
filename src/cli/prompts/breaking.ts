import { styleText } from "node:util";

import type { CreatedPromptOptions } from "@/cli/types";

export const breaking = (options: CreatedPromptOptions) => {
  if (options.config.breaking.format === "!") {
    return {
      ...(options.initial?.breaking === undefined
        ? {}
        : { initial: Boolean(options.initial.breaking) }),
      message: "Is this a breaking change?",
      name: "breaking",
      type: "confirm" as const,
    };
  }

  return {
    hint: styleText("dim", "...skip when none"),
    ...(typeof options.initial?.breaking === "string"
      ? { initial: options.initial.breaking }
      : {}),
    message: `${styleText("bold", "Add any breaking changes")}\n  ${styleText("red", "BREAKING CHANGE:")}`,
    name: "breaking",
    type: "text" as const,
  };
};
