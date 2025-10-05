import type { CreatedPromptOptions } from "../interfaces";

import { issuesMessage } from "./lang";

export const issues = ({
  config: { issuesHint, issuesPrefix },
}: CreatedPromptOptions) => {
  return {
    hint: issuesHint,
    message: issuesMessage(issuesPrefix),
    name: "issues",
    type: "text" as const,
  };
};
