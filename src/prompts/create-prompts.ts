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

const notEmpty = <T>(value: null | T | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const createPrompts = (
  { answers, config }: GitzyState,
  flags: Flags,
) => {
  return config.questions
    .filter((question) => {
      return (
        defaultConfig.questions.includes(question) &&
        !flags.skip?.includes(question)
      );
    })
    .map((name) => {
      return prompts[name]({ answers, config, flags });
    })
    .filter((value) => {
      return notEmpty(value);
    });
};
