import type { Answers } from "@/cli/types";

import { defaultResolvedConfig } from "@/core/config/defaults";

import { body } from "./body";

vi.mock("@clack/prompts", () => {
  return { multiline: vi.fn().mockResolvedValue("body text") };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const answers: Answers = {
  body: "",
  breaking: "",
  issues: [],
  scope: "",
  subject: "",
  type: "",
};

const setupBody = (configOverrides = {}, autofill = {}) => {
  return body({
    answers,
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

const getValidate = async () => {
  const { multiline } = await import("@clack/prompts");

  const factory = setupBody();

  await factory();

  const call = vi.mocked(multiline).mock.calls[0][0];

  expect(call.validate).toBeDefined();

  return call.validate as (
    value: string | undefined,
  ) => Error | string | undefined;
};

describe("body", () => {
  it("should return a factory function", () => {
    const factory = setupBody();

    expect(factory).toBeTypeOf("function");
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupBody({}, { body: "prefilled body" });

    const result = await factory();

    expect(result).toBe("prefilled body");
  });

  it("should skip prompt with empty string autofill", async () => {
    const factory = setupBody({}, { body: "" });

    const result = await factory();

    expect(result).toBe("");
  });

  it("should call multiline when no autofill", async () => {
    const { multiline } = await import("@clack/prompts");

    const factory = setupBody();

    await factory();

    expect(multiline).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add a longer description",
      }),
    );
  });

  describe("validate", () => {
    it("should return min error message when non-empty input is below min", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(2))).toBe(
        "The body must have at least 5 characters",
      );
    });

    it("should return max error message when input exceeds max", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(71))).toBe(
        "The body must not exceed 70 characters",
      );
    });

    it("should return undefined when input is valid", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(5))).toBeUndefined();
    });

    it("should return undefined when input is empty (body is optional)", async () => {
      const validate = await getValidate();

      expect(validate("")).toBeUndefined();
    });

    it("should return undefined when input is only whitespace", async () => {
      const validate = await getValidate();

      expect(validate("   \n\n  ")).toBeUndefined();
    });

    it("should return min error when trimmed input is below min", async () => {
      const validate = await getValidate();

      expect(validate("  ##  ")).toBe(
        "The body must have at least 5 characters",
      );
    });
  });
});
