import type { CreatedPromptOptions } from "@/interfaces";

export const body = (_options: CreatedPromptOptions) => {
  return {
    hint: "...supports multi line, press enter to go to next line",
    message: "Add a longer description\n",
    multiline: true,
    name: "body",
    result: (value: string) => value.trim(),
    type: "text" as const,
  };
};
