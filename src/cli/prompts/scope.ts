import type { CreatedPromptOptions } from "@/cli/types";

import { fuzzySearch } from "@/cli/utils/fuzzy-search";

import { AUTOCOMPLETE_HINT } from "./constants";

export const scope = ({
  config: { scopes },
  initial,
}: CreatedPromptOptions) => {
  const choices = scopes.map((scopeEntry) => {
    return {
      hint: scopeEntry.description?.toLowerCase() ?? "",
      indent: " ",
      message: scopeEntry.name,
      name: scopeEntry.name,
      title: scopeEntry.name,
      value: scopeEntry.name,
    };
  });

  // TODO: use skip once https://github.com/enquirer/enquirer/issues/128 is resolved
  return scopes.length > 0
    ? {
        choices,
        hint: AUTOCOMPLETE_HINT,
        ...(initial?.scope === undefined ? {} : { initial: initial.scope }),
        limit: 10,
        message: "Choose the scope",
        name: "scope",
        suggest: (input: string) => fuzzySearch(choices, ["title"], input),
        type: "autocomplete" as const,
      }
    : null;
};
