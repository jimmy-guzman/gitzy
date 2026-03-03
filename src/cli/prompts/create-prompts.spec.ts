import type { Questions } from "@/core/config/types";

import { defaultConfig } from "@/core/config/defaults";

import { createPrompts } from "./create-prompts";

interface PromptResult {
  name: string;
}

const setupCreatePrompts = (
  flags = {},
  questions: Questions = defaultConfig.questions,
): string[] => {
  const prompts = createPrompts(
    {
      answers: {
        body: "",
        breaking: "",
        issues: "",
        scope: "",
        subject: "",
        type: "",
      },
      config: { ...defaultConfig, questions },
    },
    flags,
  );

  return prompts.map((prompt) => (prompt as PromptResult).name);
};

describe("createPrompts", () => {
  it("should create default questions", () => {
    const prompts = setupCreatePrompts();

    expect(prompts).toStrictEqual([
      "type",
      "subject",
      "body",
      "breaking",
      "issues",
    ]);
  });

  it("should not create skipped questions", () => {
    const prompts = setupCreatePrompts({ skip: ["type"] });

    expect(prompts).toStrictEqual(["subject", "body", "breaking", "issues"]);
  });

  it("should not create multiple skipped questions", () => {
    const prompts = setupCreatePrompts({ skip: ["type", "body"] });

    expect(prompts).toStrictEqual(["subject", "breaking", "issues"]);
  });

  it("should only create user defined questions", () => {
    const prompts = setupCreatePrompts({}, ["type"]);

    expect(prompts).toStrictEqual(["type"]);
  });
});
