import { isCancel, text } from "@clack/prompts";

import type { Config } from "@/config/gitzy-schema";
import type { Answers } from "@/interfaces";

const EMOJI_LENGTH = 3;

export const leadingLabel = (answers?: Answers) => {
  const scope =
    answers?.scope && answers.scope !== "none" ? `(${answers.scope})` : "";

  return answers?.type ? `${answers.type}${scope}: ` : "";
};

export const subject = async ({
  answers,
  config: { disableEmoji, headerMaxLength, headerMinLength },
}: {
  answers?: Answers;
  config: Config;
}) => {
  const minTitleLengthError = `The subject must have at least ${headerMinLength} characters`;
  const maxTitleLengthError = `The subject must be less than ${headerMaxLength} characters`;
  const emojiLength = disableEmoji ? 0 : EMOJI_LENGTH;
  const label = leadingLabel(answers);

  const result = await text({
    message: "Add a short description",
    placeholder: `${headerMinLength}-${headerMaxLength} characters`,
    validate: (input) => {
      const inputLength = input?.length ?? 0;
      const isOverMaxLength =
        inputLength + label.length + emojiLength > headerMaxLength;

      if (inputLength < headerMinLength) {
        return minTitleLengthError;
      }

      if (isOverMaxLength) {
        return maxTitleLengthError;
      }

      return undefined;
    },
  });

  if (isCancel(result)) {
    process.exit(0);
  }

  return result;
};
