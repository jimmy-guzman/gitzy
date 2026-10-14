import { rmSync, writeFileSync } from "node:fs";

import { checkIfGitRepo, checkIfStaged, shouldDoGitChecks } from "./checks";
import { git, useTempGitRepo } from "./test-utils";

describe(shouldDoGitChecks, () => {
  it("should perform check if no flags", () => {
    expect(shouldDoGitChecks()).toBeTruthy();
  });

  it("should perform check if no cli flags", () => {
    expect(shouldDoGitChecks({ dryRun: false, hook: false })).toBeTruthy();
  });

  it("should skip git check if dryRun flag is true", () => {
    expect(shouldDoGitChecks({ dryRun: true, hook: false })).toBeFalsy();
  });

  it("should skip git check if hook flag is true", () => {
    expect(shouldDoGitChecks({ dryRun: false, hook: true })).toBeFalsy();
  });

  it("should skip git check if amend flag is true", () => {
    expect(shouldDoGitChecks({ amend: true })).toBeFalsy();
  });
});

describe(checkIfStaged, () => {
  useTempGitRepo();

  it("should throw when no files are staged", async () => {
    await expect(checkIfStaged()).rejects.toThrow("No files staged");
  });

  it("should resolve when files are staged", async () => {
    writeFileSync("file.txt", "hello");
    await git("add", "file.txt");

    await expect(checkIfStaged()).resolves.toBe("");
  });

  it("should throw when git diff fails", async () => {
    rmSync(".git", { force: true, recursive: true });

    await expect(checkIfStaged()).rejects.toThrow(
      "Failed to check staged files (git diff)"
    );
  });

  it("should rethrow spawn errors", async () => {
    vi.stubEnv("PATH", "");

    await expect(checkIfStaged()).rejects.toThrow("ENOENT");
  });
});

describe(checkIfGitRepo, () => {
  useTempGitRepo();

  it("should resolve when inside a git repository", async () => {
    await expect(checkIfGitRepo()).resolves.toBe("");
  });

  it("should throw when not a git repository", async () => {
    rmSync(".git", { force: true, recursive: true });

    await expect(checkIfGitRepo()).rejects.toThrow("Not a git repository");
  });

  it("should throw friendly error when git cannot be spawned", async () => {
    vi.stubEnv("PATH", "");

    await expect(checkIfGitRepo()).rejects.toThrow("Not a git repository");
  });
});
