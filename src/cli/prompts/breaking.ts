import type { CreatedPromptOptions } from "@/cli/types";
import { isString } from "@/core/guards";

export const breaking =
  ({ autofill, config, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.breaking !== undefined) {
      return autofill.breaking;
    }

    if (config.breaking.format === "!") {
      return await prompter.confirm({
        initialValue:
          initial?.breaking !== undefined &&
          initial.breaking !== "" &&
          initial.breaking !== false,
        message: "Is this a breaking change?",
      });
    }

    return await prompter.text({
      initialValue: isString(initial?.breaking) ? initial.breaking : undefined,
      message: "Add any breaking changes",
      placeholder: "skip when none",
    });
  };
