import type { Answers, CreatedPromptOptions } from "@/cli/types";

import { pluralize } from "./utils/pluralize";

const EMOJI_LENGTH = 3;

type LabelParts = Partial<Pick<Answers, "scope" | "type">>;

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

const resolveEmojiEnabled = (
  flags: CreatedPromptOptions["flags"],
  configEnabled: boolean
) => {
  if (flags.noEmoji === true || process.env.GITZY_NO_EMOJI === "1") {
    return false;
  }

  return flags.emoji ?? configEnabled;
};

export const subject = ({
  autofill,
  config: {
    emoji: { enabled: configEmojiEnabled },
    header: { max, min },
  },
  flags,
  initial,
  prompter,
}: CreatedPromptOptions) => {
  const emojiEnabled = resolveEmojiEnabled(flags, configEmojiEnabled);
  const emojiLength = emojiEnabled ? EMOJI_LENGTH : 0;

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
