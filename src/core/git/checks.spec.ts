import { x } from "tinyexec";

import { checkIfGitRepo, checkIfStaged, shouldDoGitChecks } from "./checks";

vi.mock("tinyexec");

describe("shouldDoGitChecks", () => {
  it.each(["--add", "-a", "--amend"])("should skip git check if %s", (flag) => {
    expect(shouldDoGitChecks([flag])).toBe(false);
  });

  it("should perform check if no passthrough flags", () => {
    expect(shouldDoGitChecks()).toBe(true);
  });

  it("should perform check if no cli flags", () => {
    expect(shouldDoGitChecks([], { dryRun: false, hook: false })).toBe(true);
  });

  it("should skip git check if dryRun flag is true", () => {
    expect(shouldDoGitChecks([], { dryRun: true, hook: false })).toBe(false);
  });

  it("should skip git check if hook flag is true", () => {
    expect(shouldDoGitChecks([], { dryRun: false, hook: true })).toBe(false);
  });
});

describe("checkIfStaged", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw when no files are staged (exit code 0)", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await expect(checkIfStaged()).rejects.toThrowError("No files staged");
  });

  it("should resolve when files are staged (exit code 1)", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 1, stderr: "", stdout: "" });

    await expect(checkIfStaged()).resolves.toBe("");
  });

  it("should throw when git command fails (exit code > 1)", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 128, stderr: "", stdout: "" });

    await expect(checkIfStaged()).rejects.toThrowError(
      "Failed to check staged files (git diff)",
    );
  });

  it("should rethrow spawn errors", async () => {
    const spawnError = new Error("spawn git ENOENT");

    vi.mocked(x).mockRejectedValue(spawnError);

    await expect(checkIfStaged()).rejects.toThrowError("spawn git ENOENT");
  });

  it("should call git with correct arguments", async () => {
    const mockOutput = { exitCode: 1, stderr: "", stdout: "" };
    const mockX = vi.mocked(x).mockResolvedValue(mockOutput);

    await checkIfStaged();

    expect(mockX).toHaveBeenCalledWith("git", [
      "--no-pager",
      "diff",
      "--cached",
      "--quiet",
      "--exit-code",
    ]);
  });
});

describe("checkIfGitRepo", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw when not a git repository (non-zero exit code)", async () => {
    vi.mocked(x).mockRejectedValue(
      "fatal: not a git repository (or any of the parent directories): .git",
    );

    await expect(checkIfGitRepo()).rejects.toThrowError("Not a git repository");
  });

  it("should resolve when inside a git repository (exit code 0)", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await expect(checkIfGitRepo()).resolves.toBe("");
  });

  it("should throw friendly error when git command fails (spawn error)", async () => {
    const spawnError = new Error("spawn git ENOENT");

    vi.mocked(x).mockRejectedValue(spawnError);

    await expect(checkIfGitRepo()).rejects.toThrowError("Not a git repository");
  });

  it("should call git with correct arguments", async () => {
    const mockOutput = { exitCode: 0, stderr: "", stdout: "" };
    const mockX = vi.mocked(x).mockResolvedValue(mockOutput);

    await checkIfGitRepo();

    expect(mockX).toHaveBeenCalledWith(
      "git",
      ["rev-parse", "--is-inside-work-tree"],
      {
        throwOnError: true,
      },
    );
  });
});
