import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { GitzyStore } from "./store";

describe(GitzyStore, () => {
  const originalCwd = process.cwd();
  let dir = "";
  let store = new GitzyStore();

  const writeRaw = (raw: string) => {
    mkdirSync(path.dirname(store.path), { recursive: true });
    writeFileSync(store.path, raw);
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gitzy-store-"));
    process.chdir(dir);
    store = new GitzyStore();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(store.path, { force: true });
    rmSync(dir, { force: true, recursive: true });
  });

  it("should load what was saved", () => {
    store.save({ subject: "add retry", type: "feat" });

    expect(new GitzyStore().load()).toStrictEqual({
      subject: "add retry",
      type: "feat",
    });
  });

  it("should load nothing when no answers were saved", () => {
    expect(store.load()).toStrictEqual({});
  });

  it("should load nothing when the file is not JSON", () => {
    writeRaw("{ not json");

    expect(store.load()).toStrictEqual({});
  });

  it("should load nothing when the file holds unexpected answers", () => {
    writeRaw(JSON.stringify({ type: 42 }));

    expect(store.load()).toStrictEqual({});
  });
});
