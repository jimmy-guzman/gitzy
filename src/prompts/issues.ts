import type { CreatedPrompt } from "../interfaces";

import { issuesMessage } from "./lang";

export const issues: CreatedPrompt = ({
  config: { issuesHint, issuesPrefix },
}) => {
  return {
    hint: issuesHint,
    message: issuesMessage(issuesPrefix),
    name: "issues",
    type: "text",
  };
};
