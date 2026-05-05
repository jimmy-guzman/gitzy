import { text } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

export const coAuthors = ({ autofill }: CreatedPromptOptions) => {
  return () => {
    if (autofill?.coAuthors !== undefined) {
      return Promise.resolve(
        Array.isArray(autofill.coAuthors)
          ? autofill.coAuthors.join(", ")
          : autofill.coAuthors,
      );
    }

    return text({
      message: "Add co-authors",
      placeholder: 'skip when none, e.g. "Name <email@example.com>"',
    });
  };
};
