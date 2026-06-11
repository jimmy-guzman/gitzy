import { defaultResolvedConfig } from "@/core/config/defaults";

import { issues } from "./issues";

vi.mock("@clack/prompts", () => {
  return {
    text: vi.fn().mockResolvedValue(""),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const setupIssues = (autofill = {}) => {
  return issues({
    answers: {
      body: "",
      breaking: "",
      issues: [],
      scope: "",
      subject: "",
      type: "",
    },
    autofill,
    config: defaultResolvedConfig,
    flags: {},
  });
};

describe("issues", () => {
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
    const { text } = await import("@clack/prompts");

    const factory = setupIssues();

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add issues this commit closes (closes:)",
        placeholder: "#123, #456, resolves #789, org/repo#100",
      }),
    );
  });

  it("should pass initialValue from amend", async () => {
    const { text } = await import("@clack/prompts");

    const factory = issues({
      answers: {
        body: "",
        breaking: "",
        issues: [],
        scope: "",
        subject: "",
        type: "",
      },
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
    });

    await factory();

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: "#789",
      }),
    );
  });
});
