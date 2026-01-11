import { CommitlintConfigSchema } from "./commitlint-schema";
import { ConfigSchema } from "./gitzy-schema";
import { loadConfig } from "./load-config";
import { loadGitzyConfig } from "./load-gitzy-config";

vi.mock("./load-config");

describe("loadGitzyConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic gitzy config loading", () => {
    it("should load gitzy config without commitlint when commitlint param is false", async () => {
      const gitzyConfig = {
        scopes: ["api", "ui"],
        types: ["feat", "fix"],
      };

      vi.mocked(loadConfig).mockResolvedValue(gitzyConfig);

      const result = await loadGitzyConfig(false);

      expect(loadConfig).toHaveBeenCalledExactlyOnceWith("gitzy", ConfigSchema);
      expect(result).toStrictEqual(gitzyConfig);
    });

    it("should return null when no gitzy config exists and commitlint is disabled", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null);

      const result = await loadGitzyConfig(false);

      expect(result).toBeNull();
      expect(loadConfig).toHaveBeenCalledOnce();
    });

    it("should load gitzy config with correct schema", async () => {
      vi.mocked(loadConfig).mockResolvedValue({ types: ["feat"] });

      await loadGitzyConfig(false);

      expect(loadConfig).toHaveBeenCalledWith("gitzy", ConfigSchema);
    });
  });

  describe("commitlint integration via parameter", () => {
    it("should load commitlint config when commitlint param is true", async () => {
      const gitzyConfig = { types: ["feat"] };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api"]],
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(loadConfig).toHaveBeenCalledTimes(2);
      expect(loadConfig).toHaveBeenNthCalledWith(1, "gitzy", ConfigSchema);
      expect(loadConfig).toHaveBeenNthCalledWith(
        2,
        "commitlint",
        CommitlintConfigSchema,
      );
      expect(result).toStrictEqual({
        scopes: ["api"],
        types: ["feat", "fix"],
      });
    });

    it("should merge commitlint rules with gitzy config with commitlint taking precedence", async () => {
      const gitzyConfig = {
        headerMaxLength: 50,
        scopes: ["ui"],
        types: ["feat", "fix"],
      };
      const commitlintConfig = {
        rules: {
          "header-max-length": [2, "always", 72],
          "type-enum": [2, "always", ["feature", "bugfix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(result).toStrictEqual({
        headerMaxLength: 72, // overridden
        scopes: ["ui"], // kept from gitzy
        types: ["feature", "bugfix"], // overridden
      });
    });

    it("should return only commitlint rules when no gitzy config exists", async () => {
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(result).toStrictEqual({ types: ["feat", "fix"] });
    });

    it("should return gitzy config when commitlint is enabled but no commitlint config exists", async () => {
      const gitzyConfig = { types: ["feat"] };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(null);

      const result = await loadGitzyConfig(true);

      expect(result).toStrictEqual(gitzyConfig);
    });

    it("should return null when both configs are missing and commitlint is enabled", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null);

      const result = await loadGitzyConfig(true);

      expect(result).toBeNull();
      expect(loadConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe("commitlint integration via gitzy config", () => {
    it("should use commitlint when useCommitlintConfig is true in gitzy config", async () => {
      const gitzyConfig = {
        types: ["feat"],
        useCommitlintConfig: true,
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig();

      expect(loadConfig).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        types: ["fix"],
        useCommitlintConfig: true,
      });
    });

    it("should not use commitlint when useCommitlintConfig is false in gitzy config", async () => {
      const gitzyConfig = {
        types: ["feat"],
        useCommitlintConfig: false,
      };

      vi.mocked(loadConfig).mockResolvedValueOnce(gitzyConfig);

      const result = await loadGitzyConfig();

      expect(loadConfig).toHaveBeenCalledOnce();
      expect(result).toStrictEqual(gitzyConfig);
    });

    it("should not use commitlint when useCommitlintConfig is undefined in gitzy config", async () => {
      const gitzyConfig = {
        types: ["feat"],
      };

      vi.mocked(loadConfig).mockResolvedValueOnce(gitzyConfig);

      const result = await loadGitzyConfig();

      expect(loadConfig).toHaveBeenCalledOnce();
      expect(result).toStrictEqual(gitzyConfig);
    });
  });

  describe("parameter precedence over config", () => {
    it("should use commitlint parameter true even when gitzy config says false", async () => {
      const gitzyConfig = {
        types: ["feat"],
        useCommitlintConfig: false,
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(loadConfig).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        types: ["fix"],
        useCommitlintConfig: false,
      });
    });

    it("should not use commitlint when parameter is false even when gitzy config says true", async () => {
      const gitzyConfig = {
        types: ["feat"],
        useCommitlintConfig: true,
      };

      vi.mocked(loadConfig).mockResolvedValueOnce(gitzyConfig);

      const result = await loadGitzyConfig(false);

      expect(loadConfig).toHaveBeenCalledOnce();
      expect(result).toStrictEqual(gitzyConfig);
    });

    it("should use gitzy config setting when parameter is undefined", async () => {
      const gitzyConfig = {
        types: ["feat"],
        useCommitlintConfig: true,
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(undefined);

      expect(loadConfig).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        types: ["fix"],
        useCommitlintConfig: true,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty gitzy config object", async () => {
      const gitzyConfig = {};

      vi.mocked(loadConfig).mockResolvedValueOnce(gitzyConfig);

      const result = await loadGitzyConfig(false);

      expect(result).toStrictEqual({});
    });

    it("should handle empty commitlint extracted rules", async () => {
      const gitzyConfig = { types: ["feat"] };
      const commitlintConfig = { rules: {} };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(result).toStrictEqual(gitzyConfig);
    });

    it("should handle commitlint rules with only some values defined", async () => {
      const gitzyConfig = { types: ["feat"] };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api", "ui"]],
          "type-enum": [2, "always", ["feature"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(result).toStrictEqual({
        scopes: ["api", "ui"],
        types: ["feature"],
      });
    });

    it("should handle when loadConfig throws an error", async () => {
      vi.mocked(loadConfig).mockRejectedValue(new Error("Config load failed"));

      await expect(loadGitzyConfig(false)).rejects.toThrowError(
        "Config load failed",
      );
    });

    it("should handle complex nested config objects", async () => {
      const gitzyConfig = {
        nested: {
          deep: {
            value: true,
          },
        },
        scopes: ["api", "ui"],
        types: ["feat", "fix"],
      };
      const commitlintConfig = {
        rules: {
          "header-max-length": [2, "always", 72],
          "type-enum": [2, "always", ["feature"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(result).toStrictEqual({
        headerMaxLength: 72, // added
        nested: {
          deep: {
            value: true,
          },
        }, // kept
        scopes: ["api", "ui"], // kept
        types: ["feature"], // overridden
      });
    });

    it("should call loadConfig exactly once when commitlint is not needed", async () => {
      vi.mocked(loadConfig).mockResolvedValue({ types: ["feat"] });

      await loadGitzyConfig(false);

      expect(loadConfig).toHaveBeenCalledOnce();
    });

    it("should call loadConfig exactly twice when commitlint is needed", async () => {
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce({ types: ["feat"] })
        .mockResolvedValueOnce(commitlintConfig);

      await loadGitzyConfig(true);

      expect(loadConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe("call order verification", () => {
    it("should load gitzy config before commitlint config", async () => {
      const callOrder: string[] = [];

      // eslint-disable-next-line @typescript-eslint/require-await -- mocking async function
      vi.mocked(loadConfig).mockImplementation(async (name: string) => {
        callOrder.push(name);
        if (name === "gitzy")
          return { types: ["feat"], useCommitlintConfig: true };

        return {
          rules: {
            "type-enum": [2, "always", ["feat"]],
          },
        };
      });

      await loadGitzyConfig();

      expect(callOrder).toStrictEqual(["gitzy", "commitlint"]);
    });

    it("should extract rules from commitlint config after loading", async () => {
      const gitzyConfig = { types: ["feat"] };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["core"]],
          "type-enum": [2, "always", ["fix", "feat"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await loadGitzyConfig(true);

      expect(loadConfig).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        scopes: ["core"],
        types: ["fix", "feat"],
      });
    });
  });
});
