import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { commit } from "./operations";
import { git, useTempGitRepo } from "./test-utils";

const headMessage = () => git("log", "-1", "--pretty=%B");

const commitCount = () => git("rev-list", "--count", "HEAD");

const stageFile = async () => {
  writeFileSync("file.txt", "hello");
  await git("add", "file.txt");
};

const installFailingPreCommitHook = () => {
  const hookPath = path.join(".git", "hooks", "pre-commit");

  writeFileSync(hookPath, "#!/bin/sh\nexit 1\n");
  chmodSync(hookPath, 0o755);
};

describe(commit, () => {
  useTempGitRepo();

  it("should return committed: false without committing when dryRun is true", async () => {
    await stageFile();

    const result = await commit("feat: add feature", { dryRun: true });

    expect(result).toStrictEqual({
      committed: false,
      message: "feat: add feature",
    });
    await expect(commitCount()).resolves.toBe("1");
  });

  it("should write to COMMIT_EDITMSG without committing when hook is true", async () => {
    const result = await commit("feat: add feature", { hook: true });

    expect(readFileSync(path.join(".git", "COMMIT_EDITMSG"), "utf-8")).toBe(
      "feat: add feature"
    );
    expect(result).toStrictEqual({
      committed: true,
      message: "feat: add feature",
    });
    await expect(commitCount()).resolves.toBe("1");
  });

  it("should use GIT_DIR env var when set for COMMIT_EDITMSG path", async () => {
    const gitDir = mkdtempSync(path.join(os.tmpdir(), "gitzy-git-dir-"));

    vi.stubEnv("GIT_DIR", gitDir);

    await commit("feat: add feature", { hook: true });

    expect(readFileSync(path.join(gitDir, "COMMIT_EDITMSG"), "utf-8")).toBe(
      "feat: add feature"
    );
  });

  it("should commit staged changes with the message", async () => {
    await stageFile();

    const result = await commit("feat: add feature");

    expect(result).toStrictEqual({
      committed: true,
      message: "feat: add feature",
    });
    await expect(headMessage()).resolves.toBe("feat: add feature");
    await expect(commitCount()).resolves.toBe("2");
  });

  it("should skip git hooks when noVerify is true", async () => {
    installFailingPreCommitHook();
    await stageFile();

    await commit("feat: add feature", { noVerify: true });

    await expect(headMessage()).resolves.toBe("feat: add feature");
  });

  it("should amend the previous commit when amend is true", async () => {
    await stageFile();
    await commit("feat: update feature", { amend: true });

    await expect(headMessage()).resolves.toBe("feat: update feature");
    await expect(commitCount()).resolves.toBe("1");
  });

  it("should amend and skip git hooks when both options are true", async () => {
    installFailingPreCommitHook();
    await stageFile();

    await commit("feat: update feature", { amend: true, noVerify: true });

    await expect(headMessage()).resolves.toBe("feat: update feature");
    await expect(commitCount()).resolves.toBe("1");
  });

  it("should exit with git's exit code when git commit fails", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });

    await expect(commit("feat: add feature")).rejects.toThrow(
      "process.exit(1)"
    );
    expect(exitSpy).toHaveBeenCalledExactlyOnceWith(1);
  });
});
