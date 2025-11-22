import { styleText } from "node:util";

import type { CreatedPromptOptions } from "@/interfaces";

export const issues = ({
  config: { issuesHint, issuesPrefix },
}: CreatedPromptOptions) => {
  return {
    hint: issuesHint,
    message: `${styleText("bold", `Add issues this commit closes`)}\n  ${issuesPrefix}:`,
    name: "issues",
    type: "text" as const,
  };
};
