import type { Answers } from "@/cli/types";

import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { leadingLabel, subject } from "./subject";

vi.mock("@clack/prompts", () => {
  return { text: vi.fn().mockResolvedValue("a cool feature") };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const setupSubject = (configOverrides = {}, autofill = {}) => {
  return subject({
    answers: defaultMessageParts,
    autofill,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

const answers: Partial<Answers> = {
  scope: "*",
  type: "feat",
};

const getValidate = async (
  configOverrides = {},
  results: Partial<Answers> = {},
) => {
  const { text } = await import("@clack/prompts");

  const factory = setupSubject(configOverrides);

  await factory({ results });

  const call = vi.mocked(text).mock.calls[0][0];

  expect(call.validate).toBeDefined();

  return call.validate as (
    value: string | undefined,
  ) => Error | string | undefined;
};

describe("leadingLabel", () => {
  it("should create subject's leading label with scope", () => {
    expect(leadingLabel(answers)).toBe("feat(*): ");
  });

  it("should create subject's leading label with scope & no answers", () => {
    expect(leadingLabel({})).toBe("");
  });

  it("should create subject leading label with no scope", () => {
    expect(leadingLabel({ ...answers, scope: "" })).toBe("feat: ");
  });
});

describe("subject", () => {
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
    const { text } = await import("@clack/prompts");

    const factory = setupSubject();

    await factory({ results: {} });

    expect(text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Add a short description",
        placeholder: "5-50 characters",
      }),
    );
  });

  describe("validate", () => {
    it("should return min error message when the length is not valid", async () => {
      const validate = await getValidate();

      expect(validate("#".repeat(2))).toBe(
        "The subject must have at least 5 characters",
      );
    });

    it("should return max error message when the length is not valid", async () => {
      const validate = await getValidate({}, { scope: "*", type: "fix" });

      const input = "testing the short description character counter!!!!!!!";

      expect(validate(input)).toBe("The subject must not exceed 50 characters");
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
        { scope: "*", type: "feat" },
      );

      // leadingLabel("feat(*): ") = 9 chars, emoji = 3, max = 50
      // max input = 50 - 9 - 3 = 38
      expect(validate("#".repeat(38))).toBeUndefined();
      expect(validate("#".repeat(39))).toBe(
        "The subject must not exceed 50 characters",
      );
    });

    it("should pass when emojis are disabled", async () => {
      const validate = await getValidate(
        { emoji: { ...defaultResolvedConfig.emoji, enabled: false } },
        { scope: "*", type: "feat" },
      );

      expect(validate("#".repeat(41))).toBeUndefined();
    });
  });
});
