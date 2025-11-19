import { lilconfig } from "lilconfig";
import * as valibot from "valibot";
import yaml from "yaml";

import { loadConfig } from "./load-config";

vi.mock("lilconfig");
vi.mock("yaml");
vi.mock("valibot", async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- testing
  const actual = await vi.importActual<typeof import("valibot")>("valibot");

  return {
    ...actual,
    safeParse: vi.fn(actual.safeParse),
  };
});

describe("loadConfig", () => {
  const mockSchema = valibot.object({
    name: valibot.string(),
    version: valibot.string(),
  });

  const mockExplorer = {
    clearCaches: vi.fn(),
    clearLoadCache: vi.fn(),
    clearSearchCache: vi.fn(),
    load: vi.fn(),
    search: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.mocked(lilconfig).mockReturnValue(mockExplorer);
    vi.mocked(yaml.parse).mockImplementation((content: string) => content);
  });

  describe("lilconfig initialization", () => {
    it("should initialize lilconfig with correct config name", async () => {
      mockExplorer.search.mockResolvedValue(null);

      await loadConfig("gitzy", mockSchema);

      expect(lilconfig).toHaveBeenCalledWith("gitzy", expect.any(Object));
    });

    it("should configure YAML loaders", async () => {
      mockExplorer.search.mockResolvedValue(null);

      await loadConfig("gitzy", mockSchema);

      const config = vi.mocked(lilconfig).mock.calls[0][1];

      expect(config?.loaders).toStrictEqual({
        ".yaml": expect.any(Function),
        ".yml": expect.any(Function),
        "noExt": expect.any(Function),
      });
    });

    it("should configure correct search places", async () => {
      mockExplorer.search.mockResolvedValue(null);

      await loadConfig("gitzy", mockSchema);

      const config = vi.mocked(lilconfig).mock.calls[0][1];

      expect(config?.searchPlaces).toStrictEqual([
        "package.json",
        ".gitzyrc",
        ".gitzyrc.json",
        ".gitzyrc.yaml",
        ".gitzyrc.yml",
        ".gitzyrc.js",
        ".gitzyrc.cjs",
        ".gitzyrc.mjs",
        "gitzy.config.js",
        "gitzy.config.cjs",
        "gitzy.config.mjs",
        ".config/.gitzyrc",
        ".config/.gitzyrc.json",
        ".config/.gitzyrc.yaml",
        ".config/.gitzyrc.yml",
        ".config/.gitzyrc.js",
        ".config/.gitzyrc.cjs",
        ".config/.gitzyrc.mjs",
        ".config/gitzy.config.js",
        ".config/gitzy.config.cjs",
        ".config/gitzy.config.mjs",
      ]);
    });

    it("should use process.cwd() for search", async () => {
      const originalCwd = process.cwd();

      mockExplorer.search.mockResolvedValue(null);

      await loadConfig("gitzy", mockSchema);

      expect(mockExplorer.search).toHaveBeenCalledWith(originalCwd);
    });
  });

  describe("YAML loader", () => {
    it("should parse YAML content correctly", async () => {
      mockExplorer.search.mockResolvedValue(null);
      await loadConfig("gitzy", mockSchema);

      const config = vi.mocked(lilconfig).mock.calls[0][1];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain -- testing
      const yamlLoader = config?.loaders?.[".yaml"]!;

      const content = "name: test\nversion: 1.0.0";

      vi.mocked(yaml.parse).mockResolvedValue({
        name: "test",
        version: "1.0.0",
      });

      const result = await yamlLoader("/path/to/file.yaml", content);

      expect(yaml.parse).toHaveBeenCalledWith(content);
      expect(result).toStrictEqual({ name: "test", version: "1.0.0" });
    });

    it("should use same loader for .yml extension", async () => {
      mockExplorer.search.mockResolvedValue(null);
      await loadConfig("gitzy", mockSchema);

      const config = vi.mocked(lilconfig).mock.calls[0][1];
      const yamlLoader = config?.loaders?.[".yaml"];
      const ymlLoader = config?.loaders?.[".yml"];

      expect(yamlLoader).toBe(ymlLoader);
    });

    it("should use same loader for noExt", async () => {
      mockExplorer.search.mockResolvedValue(null);
      await loadConfig("gitzy", mockSchema);

      const config = vi.mocked(lilconfig).mock.calls[0][1];
      const yamlLoader = config?.loaders?.[".yaml"];
      const noExtLoader = config?.loaders?.noExt;

      expect(yamlLoader).toBe(noExtLoader);
    });
  });

  describe("config not found", () => {
    it("should return null when no config is found", async () => {
      mockExplorer.search.mockResolvedValue(null);

      const result = await loadConfig("gitzy", mockSchema);

      expect(result).toBeNull();
    });

    it("should return null when result exists but config is undefined", async () => {
      mockExplorer.search.mockResolvedValue({
        config: undefined,
        filepath: "/path/to/config",
      });

      const result = await loadConfig("gitzy", mockSchema);

      expect(result).toBeNull();
    });

    it("should return null when result exists but config is null", async () => {
      mockExplorer.search.mockResolvedValue({
        config: null,
        filepath: "/path/to/config",
      });

      const result = await loadConfig("gitzy", mockSchema);

      expect(result).toBeNull();
    });
  });

  describe("valid config", () => {
    it("should parse and return valid config", async () => {
      const configData = { name: "gitzy", version: "1.0.0" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/.gitzyrc",
      });

      const result = await loadConfig("gitzy", mockSchema);

      expect(result).toStrictEqual(configData);
    });

    it("should pass the correct schema to safeParse", async () => {
      const customSchema = valibot.object({
        foo: valibot.string(),
      });
      const configData = { foo: "bar" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      const result = await loadConfig("test", customSchema);

      expect(result).toStrictEqual(configData);
      expect(valibot.safeParse).toHaveBeenCalledWith(customSchema, configData);
    });
  });

  describe("validation errors", () => {
    it("should throw TypeError with summarized issues for validation errors", async () => {
      const configData = { name: 123, version: "1.0.0" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(TypeError);
      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(
        "× Invalid type: Expected string but received 123\n  → at name",
      );
    });

    it("should throw TypeError for missing required fields", async () => {
      const configData = { version: "1.0.0" }; // missing 'name'

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(TypeError);
    });

    it("should throw TypeError for wrong field types", async () => {
      const configData = { name: "gitzy", version: 123 }; // version should be string

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(TypeError);
    });
  });

  describe("edge cases", () => {
    it("should handle empty config object", async () => {
      // Empty object won't pass the schema validation, so let's use optional fields
      const flexibleSchema = valibot.object({
        name: valibot.optional(valibot.string()),
        version: valibot.optional(valibot.string()),
      });
      const configData = {};

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      const result = await loadConfig("gitzy", flexibleSchema);

      expect(result).toStrictEqual(configData);
    });

    it("should handle config with different config name", async () => {
      mockExplorer.search.mockResolvedValue(null);

      await loadConfig("commitlint", mockSchema);

      expect(lilconfig).toHaveBeenCalledWith("commitlint", expect.any(Object));

      const config = vi.mocked(lilconfig).mock.calls[0][1];

      expect(config?.searchPlaces).toContain(".commitlintrc");
      expect(config?.searchPlaces).toContain("commitlint.config.js");
    });

    it("should handle config name with special characters", async () => {
      mockExplorer.search.mockResolvedValue(null);

      await loadConfig("my-special-gitzy", mockSchema);

      const config = vi.mocked(lilconfig).mock.calls[0][1];

      expect(config?.searchPlaces).toContain(".my-special-gitzyrc");
      expect(config?.searchPlaces).toContain("my-special-gitzy.config.js");
    });
  });
});
