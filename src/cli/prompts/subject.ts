import { text } from "@clack/prompts";

import type { Answers, CreatedPromptOptions } from "@/cli/types";

import { pluralize } from "./utils/pluralize";

const EMOJI_LENGTH = 3;

export const leadingLabel = (answers?: Partial<Answers>) => {
  const scope =
    answers?.scope && answers.scope !== "none" ? `(${answers.scope})` : "";

  return answers?.type ? `${answers.type}${scope}: ` : "";
};

const resolveEmojiEnabled = (
  flags: CreatedPromptOptions["flags"],
  configEnabled: boolean,
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
}: CreatedPromptOptions) => {
  const emojiEnabled = resolveEmojiEnabled(flags, configEmojiEnabled);
  const emojiLength = emojiEnabled ? EMOJI_LENGTH : 0;

  return (context?: { results: Partial<Answers> }) => {
    const validate = (value = "") => {
      const label = leadingLabel(context?.results);

      if (value.length < min) {
        return `Add ${pluralize(min - value.length, "more character")} (minimum ${min})`;
      }

      const remaining = max - label.length - emojiLength;
      const overBy = value.length - remaining;

      if (overBy > 0) {
        return `Remove ${pluralize(overBy, "character")} (${remaining} available)`;
      }

      return undefined;
    };

    if (autofill?.subject !== undefined) {
      const trimmed = autofill.subject.trim();

      if (!validate(trimmed)) return Promise.resolve(trimmed);
    }

    return text({
      initialValue: initial?.subject,
      message: "Add a short description",
      placeholder: `${min}-${max} characters`,
      validate: (value = "") => {
        return validate(value.trim());
      },
    });
  };
};
