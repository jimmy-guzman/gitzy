import * as clack from "@clack/prompts";
import type { PromptGroup } from "@clack/prompts";

import type {
  Answers,
  CommitFlags,
  CreatedPromptOptions,
  GitzyState,
  Prompter,
} from "@/cli/types";
import { splitList } from "@/core/conventional/schema";

import { body } from "./body";
import { breaking } from "./breaking";
import { coAuthors } from "./co-authors";
import { issues } from "./issues";
import { scope } from "./scope";
import { signoff } from "./signoff";
import { subject } from "./subject";
import { type } from "./type";

interface RawGroupResult {
  body?: string | symbol;
  breaking?: boolean | string | symbol;
  coAuthors?: string | symbol;
  issues?: string | symbol;
  scope?: string | symbol;
  signoff?: boolean | string | symbol;
  subject?: string | symbol;
  type?: string | symbol;
}

type PromptName = keyof RawGroupResult;

type PromptFactories = {
  [K in PromptName]: (
    options: CreatedPromptOptions
  ) => NonNullable<PromptGroup<RawGroupResult>[K]>;
};

const prompts: PromptFactories = {
  body,
  breaking,
  coAuthors,
  issues,
  scope,
  signoff,
  subject,
  type,
};

const isPromptName = (name: string): name is PromptName =>
  Object.hasOwn(prompts, name);

export const createPrompts = async (
  { answers, config }: GitzyState,
  flags: CommitFlags,
  autofill?: Partial<Answers>,
  initial?: Partial<Answers>,
  prompter: Prompter = clack
) => {
  const options = { answers, autofill, config, flags, initial, prompter };
  const activePrompts: PromptGroup<RawGroupResult> = {};
  const addPrompt = <K extends PromptName>(name: K) => {
    activePrompts[name] = prompts[name](options);
  };

  for (const question of config.prompts) {
    if (isPromptName(question)) {
      addPrompt(question);
    }
  }

  const result = await prompter.group(activePrompts, {
    onCancel: () => {
      prompter.cancel("Cancelled.");
      process.exit(0);
    },
  });

  if (prompter.isCancel(result)) {
    prompter.cancel("Cancelled.");
    process.exit(0);
  }

  return {
    body: (result.body ?? "").trim(),
    breaking: result.breaking ?? "",
    coAuthors: splitList(result.coAuthors),
    issues: splitList(result.issues),
    scope: result.scope ?? "",
    signoff: result.signoff ?? false,
    subject: result.subject ?? "",
    type: result.type ?? "",
  };
};
