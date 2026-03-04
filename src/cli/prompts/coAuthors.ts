import { styleText } from "node:util";

import type { CreatedPromptOptions } from "@/cli/types";

export const coAuthors = (_options: CreatedPromptOptions) => {
  return {
    hint: styleText(
      "dim",
      '...skip when none, e.g. "Name <email@example.com>"',
    ),
    message: "Add co-authors",
    name: "coAuthors",
    result: (value: string) => {
      const trimmed = value.trim();

      return trimmed
        ? trimmed
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [];
    },
    type: "text" as const,
  };
};
