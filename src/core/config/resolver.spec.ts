// cspell:ignore headr tpye

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { normalizeConfig } from "./normalizer";
import { resolveConfig } from "./resolver";

type Json =
  | Json[]
  | boolean
  | number
  | string
  | { [key: string]: Json | undefined }
  | null;

describe(resolveConfig, () => {
  const originalCwd = process.cwd();
  let dir = "";

  const writeConfigs = (gitzy: Json, commitlint: Json) => {
    if (gitzy !== null) {
      writeFileSync(path.join(dir, ".gitzyrc.json"), JSON.stringify(gitzy));
    }

    if (commitlint !== null) {
      writeFileSync(
        path.join(dir, ".commitlintrc.json"),
        JSON.stringify(commitlint)
      );
    }
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gitzy-resolver-"));
    process.chdir(dir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(dir, { force: true, recursive: true });
  });

  describe("basic gitzy config loading", () => {
    it("should return normalized defaults when no config files exist", async () => {
      const { config: result } = await resolveConfig();

      expect(result).toStrictEqual(normalizeConfig(null));
    });

    it("should return normalized gitzy config when only gitzy config exists", async () => {
      const gitzyConfig = {
        scopes: ["api", "ui"],
        types: ["feat", "fix"],
      };

      writeConfigs(gitzyConfig, null);

      const { config: result } = await resolveConfig();

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

      writeConfigs(gitzyConfig, null);

      const { config: result } = await resolveConfig();

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

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

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

      writeConfigs(null, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.scopes).toStrictEqual([{ name: "api" }, { name: "ui" }]);
    });
  });

  describe("commitlint auto-detection", () => {
    it("should merge commitlint rules with gitzy config — commitlint constrains types", async () => {
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

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.header.max).toBe(50);
      expect(result.scopes.map((s) => s.name)).toStrictEqual(["ui"]);
      expect(result.types.map((t) => t.name)).toStrictEqual([
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

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.scopes.map((s) => s.name)).toStrictEqual(["api", "ui"]);
    });

    it("should use commitlint types when gitzy config exists but does not define types", async () => {
      const gitzyConfig = { header: { max: 50 } };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat", "fix"]);
    });

    it("should use only commitlint rules when no gitzy config exists", async () => {
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      writeConfigs(null, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat", "fix"]);
    });

    it("should load a commitlint config with a disabled rule", async () => {
      writeConfigs(null, { rules: { "body-max-length": [0] } });

      const { config: result } = await resolveConfig();

      expect(result).toStrictEqual(normalizeConfig({}));
    });

    it("should return normalized gitzy config when commitlint is not present", async () => {
      const gitzyConfig = { types: ["feat"] };

      writeConfigs(gitzyConfig, null);

      const { config: result } = await resolveConfig();

      expect(result).toStrictEqual(normalizeConfig(gitzyConfig));
    });
  });

  describe("commitlint header rule merging", () => {
    it("should use commitlint header.max when gitzy does not set it", async () => {
      const gitzyConfig = { header: { min: 3 } };
      const commitlintConfig = {
        rules: { "header-max-length": [2, "always", 72] },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.header.max).toBe(72);
      expect(result.header.min).toBe(3);
    });

    it("should prefer gitzy header.max over commitlint when both are set", async () => {
      const gitzyConfig = { header: { max: 50, min: 3 } };
      const commitlintConfig = {
        rules: { "header-max-length": [2, "always", 72] },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

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

      writeConfigs(null, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.header.max).toBe(100);
      expect(result.header.min).toBe(5);
    });
  });

  describe("scope and type constrained merging", () => {
    it("should constrain scopes — gitzy entries in commitlint first, commitlint extras appended", async () => {
      const gitzyConfig = {
        scopes: [{ description: "Purchase Plan", name: "pp" }],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["deps", "home", "pp", "alerts"]],
        },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

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

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.scopes).toStrictEqual([
        { description: "Purchase Plan", name: "pp" },
      ]);
    });

    it("should exclude gitzy scopes not in commitlint and append commitlint extras", async () => {
      const gitzyConfig = {
        scopes: [{ name: "build" }],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api", "ui"]],
        },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.scopes.map((s) => s.name)).toStrictEqual(["api", "ui"]);
    });

    it("should constrain types — gitzy entries in commitlint first, commitlint extras appended", async () => {
      const gitzyConfig = {
        types: ["feat", "fix"],
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "perf", "fix", "chore"]],
        },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

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

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.types).toStrictEqual([
        { description: "New feature", emoji: "✨", name: "feat" },
        { description: "Fix a bug", emoji: "🐛", name: "fix" },
      ]);
    });

    it("should exclude gitzy types not in commitlint enum", async () => {
      const gitzyConfig = {
        types: ["feat", "fix", "chore", "docs"],
      };
      const commitlintConfig = {
        rules: {
          "type-enum": [2, "always", ["feat", "fix"]],
        },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat", "fix"]);
    });

    it("should exclude gitzy scopes not in commitlint enum", async () => {
      const gitzyConfig = {
        scopes: ["api", "ui", "internal"],
      };
      const commitlintConfig = {
        rules: {
          "scope-enum": [2, "always", ["api", "ui"]],
        },
      };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.scopes.map((s) => s.name)).toStrictEqual(["api", "ui"]);
    });

    it("should return undefined scopes when neither gitzy nor commitlint defines them", async () => {
      writeConfigs({}, { rules: {} });

      const { config: result } = await resolveConfig();

      expect(result.scopes).toStrictEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty commitlint rules gracefully", async () => {
      const gitzyConfig = { types: ["feat"] };
      const commitlintConfig = { rules: {} };

      writeConfigs(gitzyConfig, commitlintConfig);

      const { config: result } = await resolveConfig();

      expect(result.types.map((t) => t.name)).toStrictEqual(["feat"]);
    });

    it("should warn about typos and impossible values in the gitzy config", async () => {
      writeConfigs({ headr: { max: 1 }, prompts: ["tpye"] }, null);

      const { warnings } = await resolveConfig();

      expect(warnings).toStrictEqual([
        'Unknown config key "headr"',
        'Unknown prompt "tpye"',
      ]);
    });

    it("should not overflow on self-referencing config values", async () => {
      writeFileSync(
        path.join(dir, "gitzy.config.cjs"),
        "const o = {}; o.self = o; module.exports = { extra: o };"
      );
      writeFileSync(
        path.join(dir, ".commitlintrc.cjs"),
        "const p = {}; p.self = p; module.exports = { plugins: [p], rules: {} };"
      );

      const { warnings } = await resolveConfig();

      expect(warnings).toStrictEqual(['Unknown config key "extra"']);
    });

    it("should not warn when no config files exist", async () => {
      const { warnings } = await resolveConfig();

      expect(warnings).toStrictEqual([]);
    });

    it("should reject an invalid gitzy config", async () => {
      writeConfigs({ header: { max: "long" } }, null);

      await expect(resolveConfig()).rejects.toThrow(TypeError);
    });

    it("should reject an invalid commitlint config", async () => {
      writeConfigs(null, { rules: "none" });

      await expect(resolveConfig()).rejects.toThrow(TypeError);
    });
  });
});
