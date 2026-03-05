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

      await expect(resolveConfig()).rejects.toThrowError("Config load failed");
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
