import { cancel, group, isCancel } from "@clack/prompts";

import type { Answers, CommitFlags, GitzyState } from "@/cli/types";
import type { PromptName } from "@/core/config/defaults";

import { availablePrompts } from "@/core/config/defaults";

import { body } from "./body";
import { breaking } from "./breaking";
import { coAuthors } from "./coAuthors";
import { issues } from "./issues";
import { scope } from "./scope";
import { signoff } from "./signoff";
import { subject } from "./subject";
import { type } from "./type";

const prompts = {
  body,
  breaking,
  coAuthors,
  issues,
  scope,
  signoff,
  subject,
  type,
} as const;

interface RawGroupResult {
  body?: string;
  breaking?: boolean | string;
  coAuthors?: string;
  issues?: string;
  scope?: string;
  signoff?: boolean | string;
  subject?: string;
  type?: string;
}

const parseIssues = (raw: string | undefined): string[] => {
  if (!raw || raw.trim() === "") return [];

  return raw
    .split(",")
    .map((s) => {
      return s.trim();
    })
    .filter(Boolean);
};

const parseCoAuthors = (raw: string | undefined) => {
  if (!raw || raw.trim() === "") return [];

  return raw
    .split(",")
    .map((a) => {
      return a.trim();
    })
    .filter(Boolean);
};

export const createPrompts = async (
  { answers, config }: GitzyState,
  flags: CommitFlags,
  autofill?: Partial<Answers>,
  initial?: Partial<Answers>,
) => {
  const activePrompts: Record<
    string,
    ReturnType<(typeof prompts)[PromptName]>
  > = {};

  for (const question of config.prompts) {
    if (!(availablePrompts as readonly string[]).includes(question)) {
      continue;
    }

    const promptFn = prompts[question as PromptName];

    activePrompts[question] = promptFn({
      answers,
      autofill,
      config,
      flags,
      initial,
    });
  }

  const result = (await group(activePrompts, {
    onCancel: () => {
      cancel("Cancelled.");
      process.exit(0);
    },
  })) as RawGroupResult;

  if (isCancel(result)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  return {
    body: (result.body ?? "").trim(),
    breaking: result.breaking ?? "",
    coAuthors: parseCoAuthors(
      typeof result.coAuthors === "string" ? result.coAuthors : undefined,
    ),
    issues: parseIssues(
      typeof result.issues === "string" ? result.issues : undefined,
    ),
    scope: result.scope ?? "",
    signoff: result.signoff ?? false,
    subject: result.subject ?? "",
    type: result.type ?? "",
  };
};
