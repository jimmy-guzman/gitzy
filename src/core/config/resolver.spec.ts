import { loadConfig } from "./loader";
import { normalizeConfig } from "./normalizer";
import { resolveConfig } from "./resolver";

vi.mock("./loader");

describe("resolveConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic gitzy config loading", () => {
    it("should load gitzy config and always attempt commitlint", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null);

      await resolveConfig();

      expect(loadConfig).toHaveBeenCalledTimes(2);
    });

    it("should return normalized defaults when no config files exist", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null);

      const result = await resolveConfig();

      expect(result).toStrictEqual(normalizeConfig(null));
    });

    it("should return normalized gitzy config when only gitzy config exists", async () => {
      const gitzyConfig = {
        scopes: ["api", "ui"],
        types: ["feat", "fix"],
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(null);

      const result = await resolveConfig();

      expect(result).toStrictEqual(normalizeConfig(gitzyConfig));
    });
  });

  describe("scope object entries with descriptions", () => {
    it("should preserve scope descriptions defined in gitzy config", async () => {
      const gitzyConfig = {
        scopes: [
          { description: "dependency updates", name: "deps" },
          { name: "build" },
        ],
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(null);

      const result = await resolveConfig();

      expect(result.scopes).toStrictEqual([
        { description: "dependency updates", name: "deps" },
        { name: "build" },
      ]);
    });

    it("should prefer gitzy scopes with descriptions over commitlint string scopes", async () => {
      const gitzyConfig = {
        scopes: [{ description: "dependency updates", name: "deps" }],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["deps", "build"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.scopes).toStrictEqual([
        { description: "dependency updates", name: "deps" },
        { name: "build" },
      ]);
    });

    it("should normalize commitlint string scopes to ScopeEntry objects", async () => {
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api", "ui"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.scopes).toStrictEqual([{ name: "api" }, { name: "ui" }]);
    });
  });

  describe("commitlint auto-detection", () => {
    it("should always attempt to load commitlint config", async () => {
      vi.mocked(loadConfig).mockResolvedValue(null);

      await resolveConfig();

      expect(loadConfig).toHaveBeenCalledTimes(2);
      expect(loadConfig).toHaveBeenNthCalledWith(
        1,
        "gitzy",
        expect.any(Object),
      );
      expect(loadConfig).toHaveBeenNthCalledWith(
        2,
        "commitlint",
        expect.any(Object),
      );
    });

    it("should merge commitlint rules with gitzy config — gitzy takes precedence", async () => {
      const gitzyConfig = {
        header: { max: 50 },
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

      const result = await resolveConfig();

      expect(result.header.max).toBe(50);
      expect(result.scopes.map((s) => s.name)).toStrictEqual(["ui"]);
      expect(result.types.map((t) => t.name)).toStrictEqual([
        "feat",
        "fix",
        "feature",
        "bugfix",
      ]);
    });

    it("should use commitlint scopes when gitzy config exists but does not define scopes", async () => {
      const gitzyConfig = { header: { max: 50 } };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api", "ui"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.scopes.map((s) => s.name)).toStrictEqual(["api", "ui"]);
    });

    it("should use commitlint types when gitzy config exists but does not define types", async () => {
      const gitzyConfig = { header: { max: 50 } };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat", "fix"]);
    });

    it("should use only commitlint rules when no gitzy config exists", async () => {
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat", "fix"]);
    });

    it("should return normalized gitzy config when commitlint is not present", async () => {
      const gitzyConfig = { types: ["feat"] };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(null);

      const result = await resolveConfig();

      expect(result).toStrictEqual(normalizeConfig(gitzyConfig));
    });
  });

  describe("commitlint header rule merging", () => {
    it("should use commitlint header.max when gitzy does not set it", async () => {
      const gitzyConfig = { header: { min: 3 } };
      const commitlintConfig = {
        rules: { "header-max-length": [2, "always", 72] },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.header.max).toBe(72);
      expect(result.header.min).toBe(3);
    });

    it("should prefer gitzy header.max over commitlint when both are set", async () => {
      const gitzyConfig = { header: { max: 50, min: 3 } };
      const commitlintConfig = {
        rules: { "header-max-length": [2, "always", 72] },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.header.max).toBe(50);
      expect(result.header.min).toBe(3);
    });

    it("should merge both header.max and header.min from commitlint", async () => {
      const commitlintConfig = {
        rules: {
          "header-max-length": [2, "always", 100],
          "header-min-length": [2, "always", 5],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.header.max).toBe(100);
      expect(result.header.min).toBe(5);
    });
  });

  describe("scope and type union merging", () => {
    it("should union-merge scopes — gitzy order first, commitlint extras appended", async () => {
      const gitzyConfig = {
        scopes: [{ description: "Purchase Plan", name: "pp" }],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["deps", "home", "pp", "alerts"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.scopes).toStrictEqual([
        { description: "Purchase Plan", name: "pp" },
        { name: "deps" },
        { name: "home" },
        { name: "alerts" },
      ]);
    });

    it("should keep gitzy scope description when name matches commitlint entry", async () => {
      const gitzyConfig = {
        scopes: [{ description: "Purchase Plan", name: "pp" }],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["pp"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.scopes).toStrictEqual([
        { description: "Purchase Plan", name: "pp" },
      ]);
    });

    it("should append commitlint scopes not present in gitzy", async () => {
      const gitzyConfig = {
        scopes: [{ name: "build" }],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api", "ui"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.scopes.map((s) => s.name)).toStrictEqual([
        "build",
        "api",
        "ui",
      ]);
    });

    it("should union-merge types — gitzy order first, commitlint extras appended", async () => {
      const gitzyConfig = {
        types: ["feat", "fix"],
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "perf", "fix", "chore"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual([
        "feat",
        "fix",
        "perf",
        "chore",
      ]);
    });

    it("should keep gitzy type entry when name matches commitlint entry", async () => {
      const gitzyConfig = {
        types: [{ description: "New feature", emoji: "✨", name: "feat" }],
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.types).toStrictEqual([
        { description: "New feature", emoji: "✨", name: "feat" },
        { description: "Fix a bug", emoji: "🐛", name: "fix" },
      ]);
    });

    it("should return undefined scopes when neither gitzy nor commitlint defines them", async () => {
      vi.mocked(loadConfig)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rules: {} });

      const result = await resolveConfig();

      expect(result.scopes).toStrictEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty commitlint rules gracefully", async () => {
      const gitzyConfig = { types: ["feat"] };
      const commitlintConfig = { rules: {} };

      vi.mocked(loadConfig)
        .mockResolvedValueOnce(gitzyConfig)
        .mockResolvedValueOnce(commitlintConfig);

      const result = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat"]);
    });

    it("should propagate errors from loadConfig", async () => {
      vi.mocked(loadConfig).mockRejectedValue(new Error("Config load failed"));

      await expect(resolveConfig()).rejects.toThrow("Config load failed");
    });
  });

  describe("call order verification", () => {
    it("should load gitzy config before commitlint config", async () => {
      const callOrder: string[] = [];

      // eslint-disable-next-line @typescript-eslint/require-await -- mocking async function
      vi.mocked(loadConfig).mockImplementation(async (name: string) => {
        callOrder.push(name);

        return null;
      });

      await resolveConfig();

      expect(callOrder).toStrictEqual(["gitzy", "commitlint"]);
    });
  });
});
