import type { CreatedPromptOptions } from "@/cli/types";
import { getSignoffTrailer } from "@/core/git/signoff";
import { isString } from "@/core/guards";

export const signoff =
  ({ autofill, initial, prompter }: CreatedPromptOptions) =>
  async () => {
    if (autofill?.signoff !== undefined) {
      return autofill.signoff;
    }

    const initialValue = isString(initial?.signoff)
      ? initial.signoff
      : await getSignoffTrailer();

    return await prompter.text({
      initialValue,
      message: "Signed-off-by",
      placeholder: "leave empty to skip",
    });
  };
