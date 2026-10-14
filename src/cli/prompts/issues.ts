import type { CreatedPromptOptions } from "@/cli/types";

export const issues =
  ({
    autofill,
    config: {
      issues: { hint: issuesHint, prefix: issuesPrefix },
    },
    initial,
    prompter,
  }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.issues !== undefined) {
      return autofill.issues.join(", ");
    }

    const initialIssues =
      initial?.issues && initial.issues.length > 0
        ? initial.issues.join(", ")
        : undefined;

    return await prompter.text({
      initialValue: initialIssues,
      message: `Add issues this commit closes (${issuesPrefix}:)`,
      placeholder: issuesHint,
    });
  };
