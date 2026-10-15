import type { CreatedPromptOptions } from "@/cli/types";
import { formatMessageResult } from "@/core/conventional/message";
import { defaultMessageParts } from "@/core/conventional/types";
import type { MessageParts } from "@/core/conventional/types";
import { pluralize } from "@/core/pluralize";

type LabelParts = Partial<Pick<MessageParts, "scope" | "type">>;

export const subject = ({
  autofill,
  config,
  flags,
  initial,
  prompter,
}: CreatedPromptOptions) => {
  const { max, min } = config.header;

  return async (context?: { results: LabelParts }) => {
    const validate = (value = "") => {
      if (value.length < min) {
        return `Add ${pluralize(min - value.length, "more character")} (minimum ${min})`;
      }

      const { header } = formatMessageResult(
        config,
        {
          ...defaultMessageParts,
          ...autofill,
          ...context?.results,
          subject: value,
        },
        flags.emoji ?? true
      );
      const prefixLength = header.length - value.length;
      const remaining = max - prefixLength;
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
