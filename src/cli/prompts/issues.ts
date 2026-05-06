import { text } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

export const issues = ({
  autofill,
  config: {
    issues: { hint: issuesHint, prefix: issuesPrefix },
  },
  initial,
}: CreatedPromptOptions) => {
  return () => {
    if (autofill?.issues !== undefined) {
      return Promise.resolve(
        Array.isArray(autofill.issues)
          ? autofill.issues.join(", ")
          : autofill.issues,
      );
    }

    const initialIssues =
      initial?.issues && initial.issues.length > 0
        ? initial.issues.join(", ")
        : undefined;

    return text({
      initialValue: initialIssues,
      message: `Add issues this commit closes (${issuesPrefix}:)`,
      placeholder: issuesHint,
    });
  };
};
