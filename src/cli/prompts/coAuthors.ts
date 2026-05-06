import { text } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

export const coAuthors = ({ autofill, initial }: CreatedPromptOptions) => {
  return () => {
    if (autofill?.coAuthors !== undefined) {
      return Promise.resolve(
        Array.isArray(autofill.coAuthors)
          ? autofill.coAuthors.join(", ")
          : autofill.coAuthors,
      );
    }

    const initialValue = Array.isArray(initial?.coAuthors)
      ? initial.coAuthors.join(", ")
      : "";

    return text({
      initialValue,
      message: "Add co-authors",
      placeholder: 'skip when none, e.g. "Name <email@example.com>"',
    });
  };
};
