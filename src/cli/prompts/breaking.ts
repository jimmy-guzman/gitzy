import type { CreatedPromptOptions } from "@/cli/types";
import { isString } from "@/core/guards";

export const breaking =
  ({ autofill, config, initial, prompter }: CreatedPromptOptions) =>
  () => {
    if (autofill?.breaking !== undefined) {
      return Promise.resolve(autofill.breaking);
    }

    if (config.breaking.format === "!") {
      return prompter.confirm({
        initialValue: initial?.breaking ? Boolean(initial.breaking) : false,
        message: "Is this a breaking change?",
      });
    }

    return prompter.text({
      initialValue: isString(initial?.breaking) ? initial.breaking : undefined,
      message: "Add any breaking changes",
      placeholder: "skip when none",
    });
  };
