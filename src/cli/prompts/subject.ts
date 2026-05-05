import { text } from "@clack/prompts";

import type { Answers, CreatedPromptOptions } from "@/cli/types";

const EMOJI_LENGTH = 3;

export const leadingLabel = (answers?: Partial<Answers>) => {
  const scope =
    answers?.scope && answers.scope !== "none" ? `(${answers.scope})` : "";

  return answers?.type ? `${answers.type}${scope}: ` : "";
};

export const subject = ({
  autofill,
  config: {
    emoji: { enabled: configEmojiEnabled },
    header: { max: headerMaxLength, min: headerMinLength },
  },
  flags,
  initial,
}: CreatedPromptOptions) => {
  const emojiEnabled =
    flags.noEmoji === true ? false : (flags.emoji ?? configEmojiEnabled);
  const emojiLength = emojiEnabled ? EMOJI_LENGTH : 0;

  return (context: { results: Partial<Answers> }) => {
    if (autofill?.subject) return Promise.resolve(autofill.subject);

    return text({
      initialValue: initial?.subject,
      message: "Add a short description",
      placeholder: `${headerMinLength}-${headerMaxLength} characters`,
      validate: (value = "") => {
        const label = leadingLabel(context.results);
        const isOverMaxLength =
          value.length + label.length + emojiLength > headerMaxLength;

        if (value.length < headerMinLength) {
          return `The subject must have at least ${headerMinLength} characters`;
        }

        if (isOverMaxLength) {
          return `The subject must not exceed ${headerMaxLength} characters`;
        }

        return undefined;
      },
    });
  };
};
