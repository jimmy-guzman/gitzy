import type { CreatedPromptOptions } from "@/cli/types";

export const coAuthors =
  ({ autofill, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.coAuthors !== undefined) {
      return autofill.coAuthors.join(", ");
    }

    const initialValue = Array.isArray(initial?.coAuthors)
      ? initial.coAuthors.join(", ")
      : "";

    return await prompter.text({
      initialValue,
      message: "Add co-authors",
      placeholder: 'skip when none, e.g. "Name <email@example.com>"',
    });
  };
