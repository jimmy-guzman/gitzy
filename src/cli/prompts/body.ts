import type { CreatedPromptOptions } from "@/cli/types";

import { pluralize } from "./utils/pluralize";

export const body =
  ({
    autofill,
    config: {
      body: { max, min },
    },
    initial,
    prompter,
  }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.body !== undefined) {
      return autofill.body;
    }

    return await prompter.multiline({
      initialValue: initial?.body,
      message: "Add a longer description",
      placeholder: "Optional — press Enter twice to skip",
      validate: (value) => {
        const trimmedLength = (value ?? "").trim().length;

        if (trimmedLength > 0 && trimmedLength < min) {
          return `Add ${pluralize(min - trimmedLength, "more character")} (minimum ${min})`;
        }

        return trimmedLength > max
          ? `Remove ${pluralize(trimmedLength - max, "character")} (${max} available)`
          : undefined;
      },
    });
  };
