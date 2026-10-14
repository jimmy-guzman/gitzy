import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { init } from "./init";

describe(init, () => {
  const originalCwd = process.cwd();
  let dir = "";
  let filePath = "";

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gitzy-init-"));
    filePath = path.join(dir, ".gitzyrc.json");
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(dir, { force: true, recursive: true });
  });

  it("should write config file when it does not exist", () => {
    const result = init(dir);

    expect(result).toStrictEqual({ exists: false, filePath });
    expect(readFileSync(filePath, "utf-8")).toMatchInlineSnapshot(`
      "{
        "branch": {
          "checkout": true,
          "max": 72,
          "pattern": "{type}/{scope}/{issue}-{subject}"
        },
        "breaking": {
          "format": "footer"
        },
        "emoji": {
          "enabled": true
        },
        "header": {
          "max": 64,
          "min": 5
        },
        "issues": {
          "pattern": "github",
          "prefix": "closes"
        },
        "scopes": [],
        "types": [
          "chore",
          "docs",
          "feat",
          "fix",
          "refactor",
          "test",
          "style",
          "ci"
        ]
      }
      "
    `);
  });

  it("should not write file when it already exists", () => {
    writeFileSync(filePath, "{}");

    const result = init(dir);

    expect(result).toStrictEqual({ exists: true, filePath });
    expect(readFileSync(filePath, "utf-8")).toBe("{}");
  });

  it("should overwrite file when it already exists and force is true", () => {
    writeFileSync(filePath, "{}");

    const result = init(dir, { force: true });

    expect(result).toStrictEqual({ exists: true, filePath });
    expect(readFileSync(filePath, "utf-8")).toContain('"types"');
  });

  it("should use process.cwd() as default directory", () => {
    process.chdir(dir);

    const result = init();

    expect(result.filePath).toBe(path.join(process.cwd(), ".gitzyrc.json"));
    expect(readFileSync(result.filePath, "utf-8")).toContain('"types"');
  });
});
