import type { CreatedPromptOptions } from "@/cli/types";
import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";

export const scope =
  ({ autofill, config: { scopes }, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.scope !== undefined) {
      return autofill.scope;
    }

    const options = scopes.map((scopeEntry) => ({
      hint: scopeEntry.description,
      label: scopeEntry.name,
      value: scopeEntry.name,
    }));

    return scopes.length === 0
      ? undefined
      : await prompter.autocomplete({
          filter: createFuzzyFilter(options),
          initialValue: initial?.scope,
          maxItems: 10,
          message: "Choose the scope",
          options,
        });
  };
