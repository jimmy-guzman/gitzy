import { rmSync, writeFileSync } from "node:fs";

import { checkIfGitRepo, checkIfNothingStaged, checkIfStaged } from "./checks";
import { git, useTempGitRepo } from "./test-utils";

describe(checkIfStaged, () => {
  useTempGitRepo();

  it("should throw when no files are staged", async () => {
    await expect(checkIfStaged()).rejects.toThrow("No files staged");
  });

  it("should resolve when files are staged", async () => {
    writeFileSync("file.txt", "hello");
    await git("add", "file.txt");

    await expect(checkIfStaged()).resolves.toBeUndefined();
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

describe(checkIfNothingStaged, () => {
  useTempGitRepo();

  it("should resolve when no files are staged", async () => {
    await expect(checkIfNothingStaged()).resolves.toBeUndefined();
  });

  it("should throw when files are staged", async () => {
    writeFileSync("file.txt", "hello");
    await git("add", "file.txt");

    await expect(checkIfNothingStaged()).rejects.toThrow(
      "Staged changes found"
    );
  });
});

describe(checkIfGitRepo, () => {
  useTempGitRepo();

  it("should resolve when inside a git repository", async () => {
    await expect(checkIfGitRepo()).resolves.toBeUndefined();
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
