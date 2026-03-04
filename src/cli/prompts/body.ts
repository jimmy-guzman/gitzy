import type { CreatedPromptOptions } from "@/cli/types";

export const body = ({ initial }: CreatedPromptOptions) => {
  return {
    hint: "...supports multi line, press enter to go to next line",
    ...(initial?.body === undefined ? {} : { initial: initial.body }),
    message: "Add a longer description\n",
    multiline: true,
    name: "body",
    result: (value: string) => value.trim(),
    type: "text" as const,
  };
};
