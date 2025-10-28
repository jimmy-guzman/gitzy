import type { Flags, GitzyState } from "@/interfaces";

import { defaultConfig } from "@/defaults/config";

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
};

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

    const prompt = prompts[question]({ answers, config, flags });

    return prompt ? [prompt] : [];
  });
};
