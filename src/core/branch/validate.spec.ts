import { defaultResolvedConfig } from "@/core/config/defaults";
import type { ResolvedConfig } from "@/core/config/types";

import type { BranchParts } from "./types";
import { validateBranchParts } from "./validate";

const validParts: BranchParts = {
  scope: "",
  subject: "add dark mode",
  type: "feat",
};

const setup = (
  configOverrides: Partial<ResolvedConfig> = {},
  partsOverrides: Partial<BranchParts> = {}
) =>
  validateBranchParts(
    { ...defaultResolvedConfig, ...configOverrides },
    { ...validParts, ...partsOverrides }
  );

describe(validateBranchParts, () => {
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

  it("should allow a missing scope", () => {
    expect(setup({}, { scope: undefined })).toStrictEqual([]);
  });

  it("should report an empty subject", () => {
    expect(setup({}, { subject: "" })).toStrictEqual(["Subject is required"]);
  });

  it("should report a whitespace-only subject", () => {
    expect(setup({}, { subject: "   " })).toStrictEqual([
      "Subject is required",
    ]);
  });

  it("should report every problem at once", () => {
    expect(setup({}, { subject: "", type: "nope" })).toHaveLength(2);
  });
});
