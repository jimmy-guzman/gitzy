import { defaultResolvedConfig } from "@/core/config/defaults";

import { body } from "./body";
import { createFakePrompter } from "./test-utils";

const prompter = createFakePrompter();

const setupBody = (configOverrides = {}, autofill = {}) =>
  body({
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
    prompter,
  });

const getValidate = async (configOverrides = {}) => {
  const { multiline } = prompter;

  const factory = setupBody(configOverrides);

  await factory();

  const [[call]] = multiline.mock.calls;

  const { validate } = call;

  if (!validate || "~standard" in validate) {
    throw new Error("Expected the prompt to receive a validate function");
  }

  return validate;
};

describe(body, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a factory function", () => {
    const factory = setupBody();

    expect(factory).toBeTypeOf("function");
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupBody({}, { body: "my body" });

    const result = await factory();

    expect(result).toBe("my body");
  });

  it("should skip prompt and return empty autofill body", async () => {
    const factory = setupBody({}, { body: "" });

    const result = await factory();

    expect(result).toBe("");
  });

  it("should call multiline when no autofill", async () => {
    const { multiline } = prompter;

    const factory = setupBody();

    await factory();

    expect(multiline).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add a longer description",
        placeholder: "Optional — press Enter twice to skip",
      })
    );
  });

  describe("validate", () => {
    it.each([
      { case: "empty string", value: "" },
      { case: "whitespace only", value: "   \n  " },
      { case: "undefined", value: undefined },
    ])("should return undefined for $case", async ({ value }) => {
      const validate = await getValidate();

      expect(validate(value)).toBeUndefined();
    });

    it("should return actionable min error with characters needed", async () => {
      const validate = await getValidate({
        body: { ...defaultResolvedConfig.body, min: 10 },
      });

      expect(validate("hello")).toBe("Add 5 more characters (minimum 10)");
    });

    it("should singularize when one character is needed", async () => {
      const validate = await getValidate({
        body: { ...defaultResolvedConfig.body, min: 10 },
      });

      expect(validate("hello you")).toBe("Add 1 more character (minimum 10)");
    });

    it("should not cap body length by default", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(500))).toBeUndefined();
    });

    it("should return actionable max error with characters to remove", async () => {
      const validate = await getValidate({
        body: { ...defaultResolvedConfig.body, max: 20 },
      });

      expect(validate("#".repeat(25))).toBe(
        "Remove 5 characters (20 available)"
      );
    });

    it("should singularize when one character is over", async () => {
      const validate = await getValidate({
        body: { ...defaultResolvedConfig.body, max: 20 },
      });

      expect(validate("#".repeat(21))).toBe(
        "Remove 1 character (20 available)"
      );
    });

    it("should return undefined when length is within bounds", async () => {
      const validate = await getValidate({
        body: { ...defaultResolvedConfig.body, max: 20, min: 5 },
      });

      expect(validate("#".repeat(10))).toBeUndefined();
    });

    it("should trim before validating", async () => {
      const validate = await getValidate({
        body: { ...defaultResolvedConfig.body, min: 5 },
      });

      // 5 chars + whitespace, trimmed length = 5, should pass
      expect(validate("  hello  ")).toBeUndefined();
    });
  });
});
