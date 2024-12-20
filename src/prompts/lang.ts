import { bold, dim, red, reset } from "ansi-colors";

import type { IssuesPrefixes, PromptsLang } from "../interfaces";

const breaking = red("BREAKING CHANGE:");

const closes = (issuesPrefix: IssuesPrefixes): string => {
  return reset(`${issuesPrefix}:`);
};

export const promptsLang: PromptsLang = {
  body: {
    hint: "...supports multi line, press enter to go to next line",
    message: "Add a longer description\n",
  },
  breaking: {
    hint: dim("...skip when none"),
    message: `${bold("Add any breaking changes")}\n  ${breaking}`,
  },
  scope: {
    hint: dim("...type or use arrow keys"),
    message: "Choose the scope",
  },
  subject: { message: "Add a short description" },
  type: {
    hint: dim("...type or use arrow keys"),
    message: "Choose the type",
  },
};

export const issuesMessage = (issuesPrefix: IssuesPrefixes): string => {
  return `${bold(`Add issues this commit closes`)}\n  ${closes(issuesPrefix)}`;
};

export const errorMessage = {
  maxTitleLength: (length: number): string => {
    return `The subject must be less than ${length.toString()} characters`;
  },
  minTitleLength: (length: number): string => {
    return `The subject must have at least ${length.toString()} characters`;
  },
};
