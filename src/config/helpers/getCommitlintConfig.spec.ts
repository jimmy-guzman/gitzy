import {
  getCommitlintConfig,
  getCommitlintOverrides,
} from "./getCommitlintConfig";
import * as utils from "./loadConfig";

describe("getCommitlintConfig", () => {
  describe("getCommitlintOverrides", () => {
    it("should return all overrides", () => {
      expect(
        getCommitlintOverrides({
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

    it("should return null when there is no commitlint config", async () => {
      vi.spyOn(utils, "loadConfig").mockResolvedValueOnce(null);

      await expect(getCommitlintConfig()).resolves.toBeNull();
    });

    it("should return null when the commitlint config is not valid", async () => {
      vi.spyOn(utils, "loadConfig").mockResolvedValueOnce({
        config: "not valid",
        filepath: "",
      });

      await expect(getCommitlintConfig()).resolves.toBeNull();
    });

    it("should return commitlint config", async () => {
      vi.spyOn(utils, "loadConfig").mockResolvedValueOnce({
        config: {
          rules: {
            "scope-enum": ["", "", ["feat"]],
          },
        },
        filepath: "",
      });

      await expect(getCommitlintConfig()).resolves.toStrictEqual({
        scopes: ["feat"],
      });
    });
  });
});
