import type { Answers } from "@/cli/types";

import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { leadingLabel, subject } from "./subject";

const setupSubject = (configOverrides = {}) => {
  return subject({
    answers: defaultMessageParts,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

const answers = {
  body: "this an amazing feature, lots of details",
  breaking: "breaks everything",
  issues: ["#123"],
  scope: "*",
  subject: "a cool new feature",
  type: "feat",
};

describe("leadingLabel", () => {
  it("should create subject's leading label with scope", () => {
    expect(leadingLabel(answers)).toBe("feat(*): ");
  });

  it("should create subject's leading label with scope & no answers", () => {
    expect(leadingLabel({} as Answers)).toBe("");
  });

  it("should create subject leading label with no scope", () => {
    expect(leadingLabel({ ...answers, scope: "" })).toBe("feat: ");
  });
});

describe("subject", () => {
  it("should create default subject", () => {
    const subjectQuestion = setupSubject();

    expect(subjectQuestion).toStrictEqual(
      expect.objectContaining({
        message: expect.any(Function),
        name: "subject",
        type: "input",

        validate: expect.any(Function),
      }),
    );
  });

  describe("validate", () => {
    it("should return min error message when the length is not valid", () => {
      const { validate } = setupSubject();

      expect(validate("#".repeat(2))).toBe(
        "The subject must have at least 5 characters",
      );
    });

    it("should return max error message when the length is not valid", () => {
      const { validate } = setupSubject();

      const input = "testing the short description character counter!!!!!!!";

      expect(
        validate(input, {
          answers: { ...answers, scope: "*", type: "fix" },
          input,
        }),
      ).toBe("The subject must not exceed 50 characters");
    });

    it("should return true when the length is valid", () => {
      const { validate } = setupSubject();

      expect(validate("#".repeat(5))).toBe(true);
    });

    it("should return return true adjusted per user scope", () => {
      const { validate } = setupSubject();

      expect(validate("#".repeat(38), { answers, input: "" })).toBe(true);
    });

    it("should return return true if emojis are disabled", () => {
      const { validate } = setupSubject({
        emoji: { ...defaultResolvedConfig.emoji, enabled: false },
      });

      expect(validate("#".repeat(41), { answers, input: "" })).toBe(true);
    });
  });

  describe("message", () => {
    it("should return indicator when inputLength < headerMinLength", () => {
      const { message } = setupSubject();

      expect(message({ answers, input: "" })).toBe(
        `Add a short description(38/50)`,
      );
    });

    it("should return indicator when percentRemaining > 25", () => {
      const { message } = setupSubject();

      expect(message({ answers, input: "#".repeat(5) })).toBe(
        `Add a short description(33/50)`,
      );
    });

    it("should return indicator when percentRemaining < 0", () => {
      const { message } = setupSubject();

      expect(message({ answers, input: "#".repeat(65) })).toBe(
        `Add a short description(-27/50)`,
      );
    });

    it("should return indicator", () => {
      const { message } = setupSubject();

      expect(message({ answers, input: "#".repeat(52) })).toBe(
        `Add a short description(-14/50)`,
      );
    });

    it("should return indicator when no state", () => {
      const { message } = setupSubject();

      expect(message()).toBe(`Add a short description(47/50)`);
    });
  });
});
