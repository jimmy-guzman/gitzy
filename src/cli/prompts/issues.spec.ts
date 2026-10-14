import { defaultResolvedConfig } from "@/core/config/defaults";

import { issues } from "./issues";
import { createFakePrompter } from "./test-utils";

const prompter = createFakePrompter();

const setupIssues = (autofill = {}) =>
  issues({
    autofill,
    config: defaultResolvedConfig,
    flags: {},
    prompter,
  });

describe(issues, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a factory function", () => {
    const factory = setupIssues();

    expect(factory).toBeTypeOf("function");
  });

  it("should skip prompt and return autofill value when provided as array", async () => {
    const factory = setupIssues({ issues: ["#123", "#456"] });

    const result = await factory();

    expect(result).toBe("#123, #456");
  });

  it("should call text when no autofill", async () => {
    const { text } = prompter;

    const factory = setupIssues();

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add issues this commit closes (closes:)",
        placeholder: "#123, #456, resolves #789, org/repo#100",
      })
    );
  });

  it("should pass initialValue from amend", async () => {
    const { text } = prompter;

    const factory = issues({
      config: defaultResolvedConfig,
      flags: {},
      initial: {
        body: "",
        breaking: "",
        issues: ["#789"],
        scope: "",
        subject: "",
        type: "",
      },
      prompter,
    });

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: "#789",
      })
    );
  });
});
