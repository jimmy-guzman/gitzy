import { styleText } from "node:util";

import type { IssuesPrefixes, PromptsLang } from "../interfaces";

const breaking = styleText("red", "BREAKING CHANGE:");

const closes = (issuesPrefix: IssuesPrefixes) => {
  return styleText("reset", `${issuesPrefix}:`);
};

export const promptsLang = {
  body: {
    hint: "...supports multi line, press enter to go to next line",
    message: "Add a longer description\n",
  },
  breaking: {
    hint: styleText("dim", "...skip when none"),
    message: `${styleText("bold", "Add any breaking changes")}\n  ${breaking}`,
  },
  scope: {
    hint: styleText("dim", "...type or use arrow keys"),
    message: "Choose the scope",
  },
  subject: {
    message: "Add a short description",
  },
  type: {
    hint: styleText("dim", "...type or use arrow keys"),
    message: "Choose the type",
  },
} satisfies PromptsLang;

export const issuesMessage = (issuesPrefix: IssuesPrefixes) => {
  return `${styleText("bold", `Add issues this commit closes`)}\n  ${closes(issuesPrefix)}`;
};

export const errorMessage = {
  maxTitleLength: (length: number) => {
    return `The subject must be less than ${length.toString()} characters`;
  },
  minTitleLength: (length: number) => {
    return `The subject must have at least ${length.toString()} characters`;
  },
};
