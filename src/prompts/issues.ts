import type { CreatedPrompt } from "../interfaces";
import { issuesMessage } from "./lang";

export const issues: CreatedPrompt = ({
  config: { issuesHint, issuesPrefix },
}) => ({
  hint: issuesHint,
  message: issuesMessage(issuesPrefix),
  name: "issues",
  type: "text",
});
