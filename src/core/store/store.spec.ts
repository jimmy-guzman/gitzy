import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadAnswers, saveAnswers } from "./store";

describe(loadAnswers, () => {
  let dir = "";
  let file = "";

  const writeRaw = (raw: string) => {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, raw);
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gitzy-store-"));
    file = path.join(dir, "gitzy", "retry.json");
  });

  afterEach(() => {
    rmSync(dir, { force: true, recursive: true });
  });

  it("should load what was saved", () => {
    saveAnswers(file, { subject: "add retry", type: "feat" });

    expect(loadAnswers(file)).toStrictEqual({
      subject: "add retry",
      type: "feat",
    });
  });

  it("should save a file only the owner can read and write", () => {
    saveAnswers(file, { subject: "add retry", type: "feat" });

    expect(statSync(file).mode.toString(8).slice(-3)).toBe("600");
  });

  it("should make an existing file private when saving over it", () => {
    writeRaw("{}");
    chmodSync(file, 0o644);

    saveAnswers(file, { subject: "add retry", type: "feat" });

    expect(statSync(file).mode.toString(8).slice(-3)).toBe("600");
  });

  it("should not load answers saved to another path", () => {
    saveAnswers(path.join(dir, "other", "retry.json"), {
      subject: "add retry",
      type: "feat",
    });

    expect(loadAnswers(file)).toStrictEqual({});
  });

  it("should load nothing when no answers were saved", () => {
    expect(loadAnswers(file)).toStrictEqual({});
  });

  it("should load nothing when the file is not JSON", () => {
    writeRaw("{ not json");

    expect(loadAnswers(file)).toStrictEqual({});
  });

  it("should load nothing when the file holds unexpected answers", () => {
    writeRaw(JSON.stringify({ type: 42 }));

    expect(loadAnswers(file)).toStrictEqual({});
  });
});
