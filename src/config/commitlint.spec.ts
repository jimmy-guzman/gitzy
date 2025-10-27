import { getCommitlintOverrides, loadCommitlintConfig } from "./commitlint";
import * as utils from "./loader";

describe("loadCommitlintConfig", () => {
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

      await expect(loadCommitlintConfig()).resolves.toBeNull();
    });

    it("should throw when the commitlint config is not valid", async () => {
      vi.spyOn(utils, "loadConfig").mockResolvedValueOnce({
        config: { rules: { "header-max-length": ["2", "always", "10"] } },
        filepath: "",
      });

      await expect(loadCommitlintConfig()).rejects.toThrow(
        "× headerMaxLength must be a number",
      );
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

      await expect(loadCommitlintConfig()).resolves.toStrictEqual({
        scopes: ["feat"],
      });
    });
  });
});
