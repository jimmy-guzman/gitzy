import { defaultConfig } from "../defaults";
import { createPrompts } from "./createPrompts";

const setupCreatePrompts = (
  flags = {},
  questions = defaultConfig.questions,
): string[] => {
  return createPrompts(
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
  ).map((prompt) => {
    return prompt.name;
  });
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
