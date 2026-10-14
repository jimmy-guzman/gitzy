import type { CreatedPromptOptions } from "@/cli/types";
import { isEmojiEnabled } from "@/core/conventional/message";
import type { MessageParts } from "@/core/conventional/types";

import { pluralize } from "./utils/pluralize";

const EMOJI_LENGTH = 3;

type LabelParts = Partial<Pick<MessageParts, "scope" | "type">>;

export const leadingLabel = (answers?: LabelParts) => {
  const scope =
    answers?.scope !== undefined &&
    answers.scope !== "" &&
    answers.scope !== "none"
      ? `(${answers.scope})`
      : "";

  return answers?.type !== undefined && answers.type !== ""
    ? `${answers.type}${scope}: `
    : "";
};

export const subject = ({
  autofill,
  config,
  flags,
  initial,
  prompter,
}: CreatedPromptOptions) => {
  const { max, min } = config.header;
  const emojiLength = isEmojiEnabled(config, flags.emoji ?? true)
    ? EMOJI_LENGTH
    : 0;

  return async (context?: { results: LabelParts }) => {
    const validate = (value = "") => {
      const label = leadingLabel(context?.results);

      if (value.length < min) {
        return `Add ${pluralize(min - value.length, "more character")} (minimum ${min})`;
      }

      const remaining = max - label.length - emojiLength;
      const overBy = value.length - remaining;

      return overBy > 0
        ? `Remove ${pluralize(overBy, "character")} (${remaining} available)`
        : undefined;
    };

    if (autofill?.subject !== undefined) {
      const trimmed = autofill.subject.trim();

      if (validate(trimmed) === undefined) {
        return trimmed;
      }
    }

    return await prompter.text({
      initialValue: initial?.subject,
      message: "Add a short description",
      placeholder: `${min}-${max} characters`,
      validate: (value = "") => validate(value.trim()),
    });
  };
};
