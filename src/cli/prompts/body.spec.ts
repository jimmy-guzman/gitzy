import type { Answers } from "@/cli/types";

import { defaultResolvedConfig } from "@/core/config/defaults";

import { body } from "./body";

const answers: Answers = {
  body: "",
  breaking: "",
  issues: [],
  scope: "",
  subject: "",
  type: "",
};

const setupBody = (configOverrides = {}) => {
  return body({
    answers,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

describe("body", () => {
  it("should create body prompt", () => {
    const bodyPrompt = setupBody();

    expect(bodyPrompt).toStrictEqual(
      expect.objectContaining({
        hint: "...supports multi line, press enter to go to next line",
        multiline: true,
        name: "body",
        result: expect.any(Function),
        type: "text",
        validate: expect.any(Function),
      }),
    );
    expect(bodyPrompt.result(" whitespace ")).toBe("whitespace");
  });

  describe("validate", () => {
    it("should return min error message when non-empty input is below min", () => {
      const { validate } = setupBody();

      expect(validate("#".repeat(2))).toBe(
        "The body must have at least 5 characters",
      );
    });

    it("should return max error message when input exceeds max", () => {
      const { validate } = setupBody();

      expect(validate("#".repeat(71))).toBe(
        "The body must not exceed 70 characters",
      );
    });

    it("should return true when input is exactly at min", () => {
      const { validate } = setupBody();

      expect(validate("#".repeat(5))).toBe(true);
    });

    it("should return true when input is valid mid-range", () => {
      const { validate } = setupBody();

      expect(validate("#".repeat(35))).toBe(true);
    });

    it("should return true when input is exactly at max", () => {
      const { validate } = setupBody();

      expect(validate("#".repeat(70))).toBe(true);
    });

    it("should return true when input is empty (body is optional)", () => {
      const { validate } = setupBody();

      expect(validate("")).toBe(true);
    });
  });

  describe("message", () => {
    it("should return indicator when no state", () => {
      const { message } = setupBody();

      expect(message()).toBe("Add a longer description(70/70)\n");
    });

    it("should return indicator with remaining chars", () => {
      const { message } = setupBody();

      expect(message({ answers, input: "#".repeat(10) })).toBe(
        "Add a longer description(60/70)\n",
      );
    });

    it("should return indicator when input exceeds max", () => {
      const { message } = setupBody();

      expect(message({ answers, input: "#".repeat(80) })).toBe(
        "Add a longer description(-10/70)\n",
      );
    });
  });
});
