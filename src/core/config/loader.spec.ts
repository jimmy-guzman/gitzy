import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import * as valibot from "valibot";

import { loadConfig } from "./loader";

const schema = valibot.object({
  name: valibot.string(),
  version: valibot.string(),
});

type TestConfig = Partial<Record<"name" | "version", number | string>>;

const config = { name: "gitzy", version: "1.0.0" };

const serialize = (file: string, value: TestConfig) => {
  const json = JSON.stringify(value);

  if (path.basename(file) === "package.json") {
    return JSON.stringify({ gitzy: value });
  }

  if (/\.(?:c?js)$/u.test(file)) {
    return `module.exports = ${json};`;
  }

  if (/\.(?:mjs|m?ts)$/u.test(file)) {
    return `export default ${json};`;
  }

  return json;
};

describe(loadConfig, () => {
  const originalCwd = process.cwd();
  let dir = "";

  const writeConfig = (file: string, value: TestConfig = config) => {
    const filePath = path.join(dir, file);

    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, serialize(file, value));
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gitzy-loader-"));
    process.chdir(dir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(dir, { force: true, recursive: true });
  });

  it("should return null when no config is found", async () => {
    await expect(loadConfig("gitzy", schema)).resolves.toBeNull();
  });

  it.each([
    "package.json",
    ".gitzyrc",
    ".gitzyrc.json",
    ".gitzyrc.js",
    ".gitzyrc.cjs",
    ".gitzyrc.mjs",
    "gitzy.config.js",
    "gitzy.config.cjs",
    "gitzy.config.mjs",
    "gitzy.config.ts",
    "gitzy.config.mts",
    ".config/.gitzyrc",
    ".config/.gitzyrc.json",
    ".config/.gitzyrc.js",
    ".config/.gitzyrc.cjs",
    ".config/.gitzyrc.mjs",
    ".config/gitzy.config.js",
    ".config/gitzy.config.cjs",
    ".config/gitzy.config.mjs",
    ".config/gitzy.config.ts",
    ".config/gitzy.config.mts",
  ])("should load config from %s", async (file) => {
    writeConfig(file);

    await expect(loadConfig("gitzy", schema)).resolves.toStrictEqual(config);
  });

  it.each([".gitzyrc.yaml", ".gitzyrc.yml"])(
    "should ignore YAML config %s",
    async (file) => {
      writeFileSync(path.join(dir, file), "name: gitzy\nversion: 1.0.0\n");

      await expect(loadConfig("gitzy", schema)).resolves.toBeNull();
    }
  );

  it("should search for configs named after the given config name", async () => {
    writeConfig(".commitlintrc.json");

    await expect(loadConfig("gitzy", schema)).resolves.toBeNull();
    await expect(loadConfig("commitlint", schema)).resolves.toStrictEqual(
      config
    );
  });

  it("should return null when package.json has no matching key", async () => {
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({}));

    await expect(loadConfig("gitzy", schema)).resolves.toBeNull();
  });

  it("should apply schema defaults to an empty config", async () => {
    writeConfig(".gitzyrc.json", {});

    const result = await loadConfig(
      "gitzy",
      valibot.object({ name: valibot.optional(valibot.string(), "fallback") })
    );

    expect(result).toStrictEqual({ name: "fallback" });
  });

  it("should throw a TypeError summarizing validation issues", async () => {
    writeConfig(".gitzyrc.json", { name: 123, version: "1.0.0" });

    await expect(loadConfig("gitzy", schema)).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TypeError: × Invalid type: Expected string but received 123
        → at name]
    `);
  });

  it("should throw a TypeError for missing required fields", async () => {
    writeConfig(".gitzyrc.json", { version: "1.0.0" });

    await expect(loadConfig("gitzy", schema)).rejects.toThrow(TypeError);
  });

  it("should throw a TypeError when a TypeScript config fails to load", async () => {
    writeFileSync(path.join(dir, "gitzy.config.ts"), "export default {");

    await expect(loadConfig("gitzy", schema)).rejects.toThrow(
      /^Failed to load TypeScript config at .*gitzy\.config\.ts/u
    );
  });
});
