import * as p from "@clack/prompts";

import type { Flags, GitzyState } from "@/interfaces";

import { defaultConfig } from "@/defaults/config";

import { body } from "./body";
import { breaking } from "./breaking";
import { issues } from "./issues";
import { scope } from "./scope";
import { subject } from "./subject";
import { type } from "./type";

const shouldSkip = (question: string, flags: Flags) => {
  return (
    !defaultConfig.questions.includes(question) ||
    flags.skip?.includes(question)
  );
};

const resolvePrompt = <T>(
  question: string,
  flags: Flags,
  flagValue: T | undefined,
  promptFn: () => Promise<T>,
) => {
  if (shouldSkip(question, flags)) return Promise.resolve("");
  if (flagValue) return Promise.resolve(flagValue);

  return promptFn();
};

export const createPrompts = async (
  { answers, config }: GitzyState,
  flags: Flags,
) => {
  /* eslint-disable perfectionist/sort-objects -- order matters here */
  return p.group(
    {
      type: () => {
        return resolvePrompt("type", flags, flags.type, () => {
          return type({ config, flags });
        });
      },
      scope: () => {
        return resolvePrompt("scope", flags, flags.scope, () => {
          return scope({ config });
        });
      },
      subject: ({
        results,
      }: {
        results: { scope?: string; type?: string };
      }) => {
        return resolvePrompt("subject", flags, flags.subject, () => {
          return subject({ answers: { ...answers, ...results }, config });
        });
      },
      body: () => resolvePrompt("body", flags, flags.body, body),
      issues: () => {
        return resolvePrompt("issues", flags, flags.issues, () => {
          return issues({ config });
        });
      },
      breaking: () => {
        return resolvePrompt("breaking", flags, flags.breaking, () => {
          return breaking({ config });
        });
      },
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );
  /* eslint-enable perfectionist/sort-objects -- order matters here */
};
