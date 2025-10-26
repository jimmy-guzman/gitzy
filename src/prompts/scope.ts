import type { CreatedPromptOptions } from "@/interfaces";

import { fuzzySearch } from "@/lib/fuzzy-search";

import { promptsLang } from "./lang";

export const scope = ({ config: { scopes } }: CreatedPromptOptions) => {
  const choices = scopes.map((choice) => {
    return {
      indent: " ",
      title: choice,
      value: choice,
    };
  });

  // TODO: use skip once https://github.com/enquirer/enquirer/issues/128 is resolved
  return scopes.length > 0
    ? {
        choices,
        hint: promptsLang.scope.hint,
        limit: 10,
        message: promptsLang.scope.message,
        name: "scope",
        suggest: (input: string) => {
          return fuzzySearch(choices, ["title"], input);
        },
        type: "autocomplete" as const,
      }
    : null;
};
