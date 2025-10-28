import { extractCommitlintRules } from "./helpers";

describe("extractCommitlintRules", () => {
  it("should return all overrides", () => {
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
      headerMaxLength: 10,
      headerMinLength: 1,
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

  it("should handle partial rules configuration", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-max-length": [2, "always", 100],
        },
      }),
    ).toStrictEqual({
      headerMaxLength: 100,
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
      headerMaxLength: 50,
      types: ["feat", "fix"],
    });
  });

  it("should handle zero as a valid headerMinLength", () => {
    expect(
      extractCommitlintRules({
        rules: {
          "header-min-length": [2, "always", 0],
        },
      }),
    ).toStrictEqual({
      headerMinLength: 0,
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
