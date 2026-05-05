import { multiline } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

export const body = ({
  autofill,
  config: {
    body: { max: bodyMaxLength, min: bodyMinLength },
  },
  initial,
}: CreatedPromptOptions) => {
  return () => {
    if (autofill?.body !== undefined) return Promise.resolve(autofill.body);

    return multiline({
      initialValue: initial?.body,
      message: "Add a longer description",
      validate: (value) => {
        const trimmedLength = (value ?? "").trim().length;

        if (trimmedLength > 0 && trimmedLength < bodyMinLength) {
          return `The body must have at least ${bodyMinLength} characters`;
        }

        if (trimmedLength > bodyMaxLength) {
          return `The body must not exceed ${bodyMaxLength} characters`;
        }

        return undefined;
      },
    });
  };
};
