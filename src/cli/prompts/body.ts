import type { CreatedPromptOptions } from "@/cli/types";
import { formatBody } from "@/core/conventional/message";

import { pluralize } from "./utils/pluralize";

export const body =
  ({ autofill, config, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    const { max, min } = config.body;

    if (autofill?.body !== undefined) {
      return autofill.body;
    }

    return await prompter.multiline({
      initialValue: initial?.body,
      message: "Add a longer description",
      placeholder: "Optional — press Enter twice to skip",
      validate: (value) => {
        const trimmedLength = formatBody(config, (value ?? "").trim()).length;

        if (trimmedLength > 0 && trimmedLength < min) {
          return `Add ${pluralize(min - trimmedLength, "more character")} (minimum ${min})`;
        }

        return max !== undefined && trimmedLength > max
          ? `Remove ${pluralize(trimmedLength - max, "character")} (${max} available)`
          : undefined;
      },
    });
  };
