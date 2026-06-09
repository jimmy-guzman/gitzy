import { text } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

import { getSignoffTrailer } from "@/core/git/signoff";

export const signoff = ({ autofill, initial }: CreatedPromptOptions) => {
  return async () => {
    if (autofill?.signoff !== undefined) {
      return autofill.signoff;
    }

    const initialValue =
      typeof initial?.signoff === "string"
        ? initial.signoff
        : await getSignoffTrailer();

    return text({
      initialValue,
      message: "Signed-off-by",
      placeholder: "leave empty to skip",
    });
  };
};
