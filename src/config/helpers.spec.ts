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
});
