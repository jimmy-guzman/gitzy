import { autocomplete, isCancel } from "@clack/prompts";

import type { Config } from "@/config/gitzy-schema";

export const scope = async ({ config: { scopes } }: { config: Config }) => {
  if (scopes.length === 0) return undefined;

  const result = await autocomplete({
    maxItems: 10,
    message: "Scope for this change?",
    options: scopes.map((choice) => ({
      label: choice,
      value: choice,
    })),
    placeholder: "Select a scope",
  });

  if (isCancel(result)) {
    process.exit(0);
  }

  return result;
};
