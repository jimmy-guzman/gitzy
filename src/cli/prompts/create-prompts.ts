import type { Answers, CommitFlags, GitzyState } from "@/cli/types";
import type { PromptName } from "@/core/config/defaults";

import { defaultPrompts } from "@/core/config/defaults";

import { body } from "./body";
import { breaking } from "./breaking";
import { coAuthors } from "./coAuthors";
import { issues } from "./issues";
import { scope } from "./scope";
import { subject } from "./subject";
import { type } from "./type";

const prompts = {
  body,
  breaking,
  coAuthors,
  issues,
  scope,
  subject,
  type,
} as const;

export const createPrompts = (
  { answers, config }: GitzyState,
  flags: CommitFlags,
  initial?: Partial<Answers>,
) => {
  return config.prompts.flatMap((question) => {
    if (!(defaultPrompts as readonly string[]).includes(question)) {
      return [];
    }

    const promptFn = prompts[question as PromptName];
    const prompt = promptFn({ answers, config, flags, initial });

    return prompt ? [prompt] : [];
  });
};
