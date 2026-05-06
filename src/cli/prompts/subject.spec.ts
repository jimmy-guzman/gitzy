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

      // leadingLabel("fix(*): ") = 8 chars, emoji = 3, max = 50
      // remaining = 50 - 8 - 3 = 39, input = 54, overBy = 15
      const input = "testing the short description character counter!!!!!!!";

      expect(validate(input)).toBe("Remove 15 characters (39 available)");
    });

    it("should singularize when one character is over", async () => {
      const validate = await getValidate({}, { scope: "*", type: "feat" });

      // remaining = 50 - 9 - 3 = 38, input = 39, overBy = 1
      expect(validate("#".repeat(39))).toBe(
        "Remove 1 character (38 available)",
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
        { scope: "*", type: "feat" },
      );

      // leadingLabel("feat(*): ") = 9 chars, emoji = 3, max = 50
      // remaining = 50 - 9 - 3 = 38
      expect(validate("#".repeat(38))).toBeUndefined();
      expect(validate("#".repeat(39))).toBe(
        "Remove 1 character (38 available)",
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
