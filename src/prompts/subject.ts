import { styleText } from "node:util";

import type { Config } from "@/config/gitzy-schema";
import type { Answers, EnquirerState } from "@/interfaces";

const EMOJI_LENGTH = 3;
const PERCENT = 100;
const PERCENT_THRESHOLD = 25;

export const leadingLabel = (answers?: Answers) => {
  const scope =
    answers?.scope && answers.scope !== "none" ? `(${answers.scope})` : "";

  return answers?.type ? `${answers.type}${scope}: ` : "";
};

export const subject = ({
  config: { disableEmoji, headerMaxLength, headerMinLength },
}: {
  config: Pick<Config, "disableEmoji" | "headerMaxLength" | "headerMinLength">;
}) => {
  const minTitleLengthError = `The subject must have at least ${headerMinLength} characters`;
  const maxTitleLengthError = `The subject must not exceed ${headerMaxLength} characters`;
  const emojiLength = disableEmoji ? 0 : EMOJI_LENGTH;

  const getColor = (inputLen: number, percentRem: number) => {
    if (inputLen < headerMinLength || percentRem < 0) return "red";

    if (percentRem > PERCENT_THRESHOLD) return "green";

    return "yellow";
  };

  return {
    message: (state?: EnquirerState) => {
      const inputLength = state?.input.length ?? 0;
      const label = leadingLabel(state?.answers);
      const remainingChar =
        headerMaxLength - inputLength - label.length - emojiLength;
      const percentRemaining = (remainingChar / headerMaxLength) * PERCENT;
      const charsLeftIndicator = `${remainingChar}/${headerMaxLength}`;
      const message = `Add a short description(${styleText(getColor(inputLength, percentRemaining), charsLeftIndicator)})`;

      return styleText("bold", message);
    },
    name: "subject",
    type: "input" as const,
    validate: (input: string, state?: EnquirerState) => {
      const label = leadingLabel(state?.answers);
      const isOverMaxLength =
        input.length + label.length + emojiLength > headerMaxLength;

      if (input.length < headerMinLength) {
        return minTitleLengthError;
      }

      if (isOverMaxLength) {
        return maxTitleLengthError;
      }

      return true;
    },
  };
};
