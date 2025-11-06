import { styleText } from "node:util";

import { confirm, isCancel, text } from "@clack/prompts";

import type { Config } from "@/config/gitzy-schema";

export const breaking = async (options: { config: Config }) => {
  if (options.config.breakingChangeFormat === "!") {
    const result = await confirm({
      message: "Is this a breaking change?",
    });

    if (isCancel(result)) {
      process.exit(0);
    }

    return result;
  }

  const emoji = options.config.disableEmoji
    ? ""
    : ` ${options.config.breakingChangeEmoji} `;

  const result = await text({
    message: styleText("red", `BREAKING CHANGE:${emoji}`),
    placeholder: "Add breaking changes (optional)",
  });

  if (isCancel(result)) {
    process.exit(0);
  }

  return result.trim();
};
