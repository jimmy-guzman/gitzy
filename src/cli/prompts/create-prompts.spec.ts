import { defaultResolvedConfig } from "@/core/config/defaults";

import { createPrompts } from "./create-prompts";

interface PromptResult {
  name: string;
}

const setupCreatePrompts = (
  prompts: readonly string[] = defaultResolvedConfig.prompts,
): string[] => {
  const results = createPrompts(
    {
      answers: {
        body: "",
        breaking: "",
        issues: [],
        scope: "",
        subject: "",
        type: "",
      },
      config: { ...defaultResolvedConfig, prompts },
    },
    {},
  );

  return results.map((prompt) => (prompt as PromptResult).name);
};

describe("createPrompts", () => {
  it("should create default questions", () => {
    const results = setupCreatePrompts();

    expect(results).toStrictEqual([
      "type",
      "subject",
      "body",
      "breaking",
      "issues",
      "coAuthors",
    ]);
  });

  it("should only create user defined questions", () => {
    const results = setupCreatePrompts(["type"]);

    expect(results).toStrictEqual(["type"]);
  });

  it("should skip unknown question names", () => {
    const results = setupCreatePrompts(["type", "unknown-prompt"]);

    expect(results).toStrictEqual(["type"]);
  });
});
