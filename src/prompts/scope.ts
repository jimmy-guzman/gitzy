import type { Scopes } from "@/config/gitzy-schema";

import { fuzzySearch } from "@/lib/fuzzy-search";

import { AUTOCOMPLETE_HINT } from "./constants";

export const scope = ({
  config: { scopes },
}: {
  config: { scopes: Scopes };
}) => {
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
        hint: AUTOCOMPLETE_HINT,
        limit: 10,
        message: "Choose the scope",
        name: "scope",
        suggest: (input: string) => fuzzySearch(choices, ["title"], input),
        type: "autocomplete" as const,
      }
    : null;
};
