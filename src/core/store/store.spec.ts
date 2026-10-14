import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadAnswers, saveAnswers, storePath } from "./store";

const writeRaw = (raw: string) => {
  mkdirSync(path.dirname(storePath()), { recursive: true });
  writeFileSync(storePath(), raw);
};

describe(loadAnswers, () => {
  const originalCwd = process.cwd();
  let dir = "";

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gitzy-store-"));
    process.chdir(dir);
  });

  afterEach(() => {
    rmSync(storePath(), { force: true });
    process.chdir(originalCwd);
    rmSync(dir, { force: true, recursive: true });
  });

  it("should load what was saved", () => {
    saveAnswers({ subject: "add retry", type: "feat" });

    expect(loadAnswers()).toStrictEqual({
      subject: "add retry",
      type: "feat",
    });
  });

  it("should load nothing when no answers were saved", () => {
    expect(loadAnswers()).toStrictEqual({});
  });

  it("should load nothing when the file is not JSON", () => {
    writeRaw("{ not json");

    expect(loadAnswers()).toStrictEqual({});
  });

  it("should load nothing when the file holds unexpected answers", () => {
    writeRaw(JSON.stringify({ type: 42 }));

    expect(loadAnswers()).toStrictEqual({});
  });
});
