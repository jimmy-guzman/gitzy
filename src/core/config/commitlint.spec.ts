import { extractCommitlintRules } from "./commitlint";

describe("extractCommitlintRules", () => {
  it("should return all overrides mapped to v7 nested config shape", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-max-length": [2, "always", 10],
          "header-min-length": [2, "always", 1],
          "scope-enum": [2, "always", ["1", "2"]],
          "type-enum": [2, "always", ["1", "2"]],
        },
      }),
    ).toMatchObject({
      header: { max: 10, min: 1 },
      scopes: ["1", "2"],
      types: ["1", "2"],
    });
  });

  it("should return empty object when config has no rules", () => {
    expect(extractCommitlintRules({})).toStrictEqual({});
  });

  it("should return empty object when rules is undefined", () => {
    expect(extractCommitlintRules({ rules: undefined })).toStrictEqual({});
  });

  it("should handle partial rules — only header-max-length", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-max-length": [2, "always", 100],
        },
      }),
    ).toStrictEqual({
      header: { max: 100 },
    });
  });

  it("should handle partial rules — only header-min-length", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-min-length": [2, "always", 5],
        },
      }),
    ).toStrictEqual({
      header: { min: 5 },
    });
  });

  it("should only include defined values", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-max-length": [2, "always", 50],
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      }),
    ).toStrictEqual({
      header: { max: 50 },
      types: ["feat", "fix"],
    });
  });

  it("should handle zero as a valid header min length", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-min-length": [2, "always", 0],
        },
      }),
    ).toStrictEqual({
      header: { min: 0 },
    });
  });

  it("should handle empty arrays for scopes and types", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "scope-enum": [2, "always", []],
          "type-enum": [2, "always", []],
        },
      }),
    ).toStrictEqual({
      scopes: [],
      types: [],
    });
  });
});
