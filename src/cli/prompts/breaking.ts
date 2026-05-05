import { confirm, text } from "@clack/prompts";

import type { CreatedPromptOptions } from "@/cli/types";

export const breaking = ({
  autofill,
  config,
  initial,
}: CreatedPromptOptions) => {
  return () => {
    if (autofill?.breaking !== undefined) {
      return Promise.resolve(autofill.breaking);
    }

    if (config.breaking.format === "!") {
      return confirm({
        initialValue: initial?.breaking ? Boolean(initial.breaking) : false,
        message: "Is this a breaking change?",
      });
    }

    return text({
      initialValue:
        typeof initial?.breaking === "string" ? initial.breaking : undefined,
      message: "Add any breaking changes",
      placeholder: "skip when none",
    });
  };
};
