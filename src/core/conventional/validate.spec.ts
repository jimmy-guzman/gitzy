import { defaultResolvedConfig } from "@/core/config/defaults";
import type { ResolvedConfig } from "@/core/config/types";

import { defaultMessageParts } from "./types";
import { validateMessageParts } from "./validate";

const validParts = {
  ...defaultMessageParts,
  scope: "",
  subject: "a cool new feature",
  type: "feat",
};

const setup = (
  configOverrides: Partial<ResolvedConfig> = {},
  partsOverrides: Partial<typeof validParts> = {},
  emoji = true
) =>
  validateMessageParts(
    { ...defaultResolvedConfig, ...configOverrides },
    { ...validParts, ...partsOverrides },
    emoji
  );

describe(validateMessageParts, () => {
  it("should return no problems for valid parts", () => {
    expect(setup()).toStrictEqual([]);
  });

  it("should report an invalid type", () => {
    expect(setup({}, { type: "nope" })).toStrictEqual([
      'Invalid type "nope". Allowed types: chore, ci, docs, feat, fix, perf, refactor, release, revert, style, test',
    ]);
  });

  it("should report an invalid scope when scopes are configured", () => {
    expect(
      setup({ scopes: [{ name: "api" }] }, { scope: "bogus" })
    ).toStrictEqual(['Invalid scope "bogus". Allowed scopes: api']);
  });

  it("should allow an empty or 'none' scope even when scopes are configured", () => {
    expect(setup({ scopes: [{ name: "api" }] }, { scope: "" })).toStrictEqual(
      []
    );
    expect(
      setup({ scopes: [{ name: "api" }] }, { scope: "none" })
    ).toStrictEqual([]);
  });

  it("should report a subject shorter than header.min", () => {
    expect(setup({}, { subject: "hi" })).toStrictEqual([
      "Add 3 more characters (minimum 5)",
    ]);
  });

  it("should report a header longer than header.max", () => {
    expect(
      setup({ header: { max: 20, min: 5 } }, { scope: "api", type: "feat" })
    ).toStrictEqual(["Remove 11 characters from the header (max 20)"]);
  });

  it("should measure the header without emoji when emoji is disabled", () => {
    // "feat: a cool new feature" = 25 chars; with emoji "feat: ✨ a cool new feature" = 27
    expect(setup({ header: { max: 25, min: 5 } }, {}, false)).toStrictEqual([]);
    expect(setup({ header: { max: 25, min: 5 } }, {}, true)).toStrictEqual([
      "Remove 1 character from the header (max 25)",
    ]);
  });

  it("should report a body shorter than body.min", () => {
    expect(setup({}, { body: "hi" })).toStrictEqual([
      "Add 3 more characters to the body (minimum 5)",
    ]);
  });

  it("should allow an empty body", () => {
    expect(setup({}, { body: "" })).toStrictEqual([]);
  });

  it("should report a body longer than body.max", () => {
    expect(
      setup(
        { body: { max: 10, min: 1 } },
        { body: "this body is way too long" }
      )
    ).toStrictEqual(["Remove 15 characters from the body (max 10)"]);
  });

  it("should report every problem at once", () => {
    expect(setup({}, { subject: "hi", type: "nope" })).toHaveLength(2);
  });
});
