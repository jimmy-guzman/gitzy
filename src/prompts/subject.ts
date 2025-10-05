import { styleText } from "node:util";

import type { Answers, CreatedPrompt, EnquirerState } from "../interfaces";

import { errorMessage, promptsLang } from "./lang";

const EMOJI_LENGTH = 3;

const PERCENT = 100;

const PERCENT_THRESHOLD = 25;

export const leadingLabel = (answers?: Answers): string => {
  const scope =
    answers?.scope && answers.scope !== "none" ? `(${answers.scope})` : "";

  return answers?.type ? `${answers.type}${scope}: ` : "";
};

export const subject: CreatedPrompt = ({
  config: { disableEmoji, headerMaxLength, headerMinLength },
}) => {
  const minTitleLengthError = errorMessage.minTitleLength(headerMinLength);
  const maxTitleLengthError = errorMessage.maxTitleLength(headerMaxLength);
  const {
    subject: { message },
  } = promptsLang;
  const emojiLength = disableEmoji ? 0 : EMOJI_LENGTH;

  return {
    message: (state?: EnquirerState): string => {
      const getCharsLeftText = (): string => {
        const label = leadingLabel(state?.answers);
        const inputLength = state ? state.input.length : 0;
        const remainingChar =
          headerMaxLength - inputLength - label.length - emojiLength;
        const percentRemaining = (remainingChar / headerMaxLength) * PERCENT;
        const charsLeftIndicator = `${remainingChar.toString()}/${headerMaxLength.toString()}`;

        if (inputLength < headerMinLength) {
          return styleText("red", charsLeftIndicator);
        }

        if (percentRemaining > PERCENT_THRESHOLD) {
          return styleText("green", charsLeftIndicator);
        }

        if (percentRemaining < 0) {
          return styleText("red", charsLeftIndicator);
        }

        return styleText("yellow", charsLeftIndicator);
      };

      return styleText("bold", `${message}(${getCharsLeftText()})`);
    },
    name: "subject",
    type: "input",
    validate: (input: string, state?: EnquirerState): string | true => {
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
