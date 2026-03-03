import type { Flags, GitzyState } from "@/cli/types";

import { defaultConfig } from "@/core/config/defaults";

import { body } from "./body";
import { breaking } from "./breaking";
import { issues } from "./issues";
import { scope } from "./scope";
import { subject } from "./subject";
import { type } from "./type";

const prompts = {
  body,
  breaking,
  issues,
  scope,
  subject,
  type,
} as const;

export const createPrompts = (
  { answers, config }: GitzyState,
  flags: Flags,
) => {
  return config.questions.flatMap((question) => {
    if (
      !defaultConfig.questions.includes(question) ||
      flags.skip?.includes(question)
    ) {
      return [];
    }

    const promptFn = prompts[question];
    const prompt = promptFn({ answers, config, flags });

    return prompt ? [prompt] : [];
  });
};
