import { styleText } from "node:util";

import type { CreatedPromptOptions, EnquirerState } from "@/cli/types";

const PERCENT = 100;
const PERCENT_THRESHOLD = 25;

const getColor = (inputLen: number, min: number, percentRem: number) => {
  if (inputLen > 0 && inputLen < min) return "red";

  if (percentRem < 0) return "red";

  if (percentRem > PERCENT_THRESHOLD) return "green";

  return "yellow";
};

export const body = ({
  config: {
    body: { max: bodyMaxLength, min: bodyMinLength },
  },
  initial,
}: CreatedPromptOptions) => {
  const minBodyLengthError = `The body must have at least ${bodyMinLength} characters`;
  const maxBodyLengthError = `The body must not exceed ${bodyMaxLength} characters`;

  return {
    hint: "...supports multi line, press enter to go to next line",
    ...(initial?.body === undefined ? {} : { initial: initial.body }),
    message: (state?: EnquirerState) => {
      const inputLength = state?.input.length ?? 0;
      const remainingChar = bodyMaxLength - inputLength;
      const percentRemaining = (remainingChar / bodyMaxLength) * PERCENT;
      const charsLeftIndicator = `${remainingChar}/${bodyMaxLength}`;
      const message = `Add a longer description(${styleText(getColor(inputLength, bodyMinLength, percentRemaining), charsLeftIndicator)})\n`;

      return styleText("bold", message);
    },
    multiline: true,
    name: "body",
    result: (value: string) => value.trim(),
    type: "text" as const,
    validate: (input: string) => {
      if (input.length > 0 && input.length < bodyMinLength) {
        return minBodyLengthError;
      }

      if (input.length > bodyMaxLength) {
        return maxBodyLengthError;
      }

      return true;
    },
  };
};
