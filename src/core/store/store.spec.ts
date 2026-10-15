import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadAnswers, saveAnswers } from "./store";

describe(loadAnswers, () => {
  let dir = "";
  let file = "";

  const writeRaw = (raw: string) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, raw);
  };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "gitzy-store-"));
    file = path.join(dir, "gitzy", "retry.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { force: true, recursive: true });
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

    expect(fs.statSync(file).mode.toString(8).slice(-3)).toBe("600");
  });

  it("should make an existing file private when saving over it", () => {
    writeRaw("{}");
    fs.chmodSync(file, 0o644);

    saveAnswers(file, { subject: "add retry", type: "feat" });

    expect(fs.statSync(file).mode.toString(8).slice(-3)).toBe("600");
  });

  it("should save when an earlier save left a temp file behind", () => {
    writeRaw("{}");
    fs.writeFileSync(`${file}.${process.pid}.tmp`, "{}");

    saveAnswers(file, { subject: "add retry", type: "feat" });

    expect(loadAnswers(file)).toStrictEqual({
      subject: "add retry",
      type: "feat",
    });
  });

  it("should keep the previous answers when saving fails", () => {
    saveAnswers(file, { subject: "add retry", type: "feat" });
    vi.spyOn(fs, "writeFileSync").mockImplementationOnce(() => {
      throw new Error("ENOSPC");
    });

    expect(() => {
      saveAnswers(file, { subject: "other", type: "fix" });
    }).toThrow("ENOSPC");
    expect(loadAnswers(file)).toStrictEqual({
      subject: "add retry",
      type: "feat",
    });
    expect(fs.readdirSync(path.dirname(file))).toStrictEqual(["retry.json"]);
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
