import Enquirer from "enquirer";

declare module "enquirer" {
  interface BasePromptOptions {
    hint?: string;
    limit?: number;
    multiline?: boolean;
    suggest?(...args: unknown[]): unknown;
  }

  interface Choice {
    indent?: string;
  }
}

interface EnquirerOptions {
  autofill?: boolean;
  cancel?: () => void;
  styles?: Record<string, (value: string) => string>;
}

/**
 * Thin adapter for Enquirer that isolates two library-boundary casts:
 *
 * 1. `autofill as T` — Enquirer<T> types its constructor `answers` as `T`,
 *    but autofill semantics only require a partial object.
 *
 * 2. `prompts as …` — Enquirer's published PromptOptions are incomplete
 *    (missing hint, suggest, multi-arg callbacks, string[] result).
 */
export const createEnquirer = <T extends object>(
  options: EnquirerOptions,
  autofill: Partial<T>,
) => {
  const enquirer = new Enquirer<T>(options, autofill as T);

  return {
    prompt: (questions: object[]) => {
      return enquirer.prompt(
        questions as Parameters<typeof enquirer.prompt>[0],
      );
    },
  };
};
