import { styleText } from "node:util";

import type { CreatedPromptOptions } from "@/cli/types";

export const issues = ({
  config: {
    issues: { hint: issuesHint, prefix: issuesPrefix },
  },
  initial,
}: CreatedPromptOptions) => {
  const initialIssues =
    initial?.issues && initial.issues.length > 0
      ? initial.issues.join(", ")
      : undefined;

  return {
    hint: issuesHint,
    ...(initialIssues === undefined ? {} : { initial: initialIssues }),
    message: `${styleText("bold", `Add issues this commit closes`)}\n  ${issuesPrefix}:`,
    name: "issues",
    type: "text" as const,
  };
};
