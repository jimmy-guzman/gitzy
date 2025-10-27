import { lilconfig } from "lilconfig";
import * as valibot from "valibot";
import yaml from "yaml";

import { loadConfig } from "./load-config";

vi.mock("lilconfig");
vi.mock("yaml");
vi.mock("valibot", async () => {
  const actual = await vi.importActual("valibot");

  return {
    ...actual,
    isValiError: vi.fn(),
    parseAsync: vi.fn(),
    summarize: vi.fn(),
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
    vi.mocked(lilconfig).mockReturnValue(mockExplorer);
    vi.mocked(yaml.parse).mockImplementation((content: string) => {
      return content;
    });
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

      vi.mocked(yaml.parse).mockReturnValue({ name: "test", version: "1.0.0" });

      const result = yamlLoader("/path/to/file.yaml", content);

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
      expect(valibot.parseAsync).not.toHaveBeenCalled();
    });

    it("should return null when result exists but config is undefined", async () => {
      mockExplorer.search.mockResolvedValue({
        config: undefined,
        filepath: "/path/to/config",
      });

      const result = await loadConfig("gitzy", mockSchema);

      expect(result).toBeNull();
      expect(valibot.parseAsync).not.toHaveBeenCalled();
    });

    it("should return null when result exists but config is null", async () => {
      mockExplorer.search.mockResolvedValue({
        config: null,
        filepath: "/path/to/config",
      });

      const result = await loadConfig("gitzy", mockSchema);

      expect(result).toBeNull();
      expect(valibot.parseAsync).not.toHaveBeenCalled();
    });
  });

  describe("valid config", () => {
    it("should parse and return valid config", async () => {
      const configData = { name: "gitzy", version: "1.0.0" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/.gitzyrc",
      });

      vi.mocked(valibot.parseAsync).mockResolvedValue(configData);

      const result = await loadConfig("gitzy", mockSchema);

      expect(valibot.parseAsync).toHaveBeenCalledWith(mockSchema, configData);
      expect(result).toStrictEqual(configData);
    });

    it("should pass the correct schema to parseAsync", async () => {
      const customSchema = valibot.object({
        foo: valibot.string(),
      });
      const configData = { foo: "bar" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });
      vi.mocked(valibot.parseAsync).mockResolvedValue(configData);

      await loadConfig("test", customSchema);

      expect(valibot.parseAsync).toHaveBeenCalledWith(customSchema, configData);
    });
  });

  describe("validation errors", () => {
    it("should throw TypeError with summarized issues for valibot errors", async () => {
      const configData = { name: 123, version: "1.0.0" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      const valiError = {
        issues: [
          {
            expected: "string",
            input: 123,
            kind: "schema",
            message: "Invalid type: Expected string but received number",
            path: [{ key: "name" }],
            received: "number",
            type: "string",
          },
        ],
      };

      vi.mocked(valibot.parseAsync).mockRejectedValue(valiError);
      vi.mocked(valibot.isValiError).mockReturnValue(true);
      vi.mocked(valibot.summarize).mockReturnValue(
        "Invalid type at name: Expected string but received number",
      );

      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(TypeError);
      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(
        "Invalid type at name: Expected string but received number",
      );

      expect(valibot.summarize).toHaveBeenCalledWith(valiError.issues);
    });

    it("should include original error as cause for valibot errors", async () => {
      const configData = { invalid: "data" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      const valiError = {
        issues: [{ message: "Validation failed" }],
      };

      vi.mocked(valibot.parseAsync).mockRejectedValue(valiError);
      vi.mocked(valibot.isValiError).mockReturnValue(true);
      vi.mocked(valibot.summarize).mockReturnValue("Validation failed");

      try {
        await loadConfig("gitzy", mockSchema);

        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as TypeError).cause).toBe(valiError);
      }
    });

    it("should throw TypeError for non-valibot errors", async () => {
      const configData = { name: "test", version: "1.0.0" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      const genericError = new Error("Something went wrong");

      vi.mocked(valibot.parseAsync).mockRejectedValue(genericError);
      vi.mocked(valibot.isValiError).mockReturnValue(false);

      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(TypeError);
      await expect(loadConfig("gitzy", mockSchema)).rejects.toThrow(
        "Invalid configuration",
      );

      expect(valibot.summarize).not.toHaveBeenCalled();
    });

    it("should include original error as cause for non-valibot errors", async () => {
      const configData = { name: "test", version: "1.0.0" };

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      const genericError = new Error("Something went wrong");

      vi.mocked(valibot.parseAsync).mockRejectedValue(genericError);
      vi.mocked(valibot.isValiError).mockReturnValue(false);

      try {
        await loadConfig("gitzy", mockSchema);

        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as TypeError).cause).toBe(genericError);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty config object", async () => {
      const configData = {};

      mockExplorer.search.mockResolvedValue({
        config: configData,
        filepath: "/path/to/config",
      });

      vi.mocked(valibot.parseAsync).mockResolvedValue(configData);

      const result = await loadConfig("gitzy", mockSchema);

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
