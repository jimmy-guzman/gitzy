import { text } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

import { getSignoffTrailer } from "@/core/git/signoff";

export const signoff = ({ autofill, initial }: CreatedPromptOptions) => {
  return async () => {
    // Flag override (`-s` → true, `--signoff "X"` → string) skips the prompt.
    if (autofill?.signoff !== undefined) {
      return autofill.signoff;
    }

    // Prefer the prior signature when amending; otherwise derive from git.
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
