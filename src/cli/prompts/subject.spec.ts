import { defaultResolvedConfig } from "@/core/config/defaults";
import type { MessageParts } from "@/core/conventional/types";

import { subject } from "./subject";
import { createFakePrompter } from "./test-utils";

const prompter = createFakePrompter();

const setupSubject = (configOverrides = {}, autofill = {}) =>
  subject({
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
    prompter,
  });

const getValidate = async (
  configOverrides = {},
  results: Partial<MessageParts> = {}
) => {
  const { text } = prompter;

  const factory = setupSubject(configOverrides);

  await factory({ results });

  const [[call]] = text.mock.calls;

  const { validate } = call;

  if (!validate || "~standard" in validate) {
    throw new Error("Expected the prompt to receive a validate function");
  }

  return validate;
};

describe(subject, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a factory function", () => {
    const factory = setupSubject();

    expect(factory).toBeTypeOf("function");
  });

  it("should skip prompt and return autofill value when provided", async () => {
    const factory = setupSubject({}, { subject: "my subject" });

    const result = await factory({ results: {} });

    expect(result).toBe("my subject");
  });

  it("should call text when no autofill", async () => {
    const { text } = prompter;

    const factory = setupSubject();

    await factory({ results: {} });

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add a short description",
        placeholder: "5-64 characters",
      })
    );
  });

  describe("validate", () => {
    it("should return actionable min error with characters needed", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(2))).toBe("Add 3 more characters (minimum 5)");
    });

    it("should singularize when one character is needed", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(4))).toBe("Add 1 more character (minimum 5)");
    });

    it("should return actionable max error with characters to remove and remaining budget", async () => {
      const validate = await getValidate({}, { scope: "*", type: "fix" });

      // leadingLabel("fix(*): ") = 8 chars, emoji = 3, max = 64
      // remaining = 64 - 8 - 3 = 53, input = 68, overBy = 15
      const input =
        "testing the short description character counter that is way too long";

      expect(validate(input)).toBe("Remove 15 characters (53 available)");
    });

    it("should singularize when one character is over", async () => {
      const validate = await getValidate({}, { scope: "*", type: "feat" });

      // header prefix "feat(*): ✨ " = 11 chars, max = 64
      // remaining = 64 - 11 = 53, input = 54, overBy = 1
      expect(validate("#".repeat(54))).toBe(
        "Remove 1 character (53 available)"
      );
    });

    it("should return undefined when the length is valid", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(5))).toBeUndefined();
    });

    it("should account for scope and type in max length calculation", async () => {
      const validate = await getValidate({}, { scope: "*", type: "feat" });

      expect(validate("#".repeat(38))).toBeUndefined();
    });

    it("should account for emoji length", async () => {
      const validate = await getValidate(
        { emoji: { ...defaultResolvedConfig.emoji, enabled: true } },
        { scope: "*", type: "feat" }
      );

      // header prefix "feat(*): ✨ " = 11 chars, max = 64, remaining = 53
      expect(validate("#".repeat(53))).toBeUndefined();
      expect(validate("#".repeat(54))).toBe(
        "Remove 1 character (53 available)"
      );
    });

    it("should pass when emojis are disabled", async () => {
      const validate = await getValidate(
        { emoji: { ...defaultResolvedConfig.emoji, enabled: false } },
        { scope: "*", type: "feat" }
      );

      // header prefix "feat(*): " = 9 chars, max = 64, remaining = 55
      expect(validate("#".repeat(55))).toBeUndefined();
    });
  });
});
