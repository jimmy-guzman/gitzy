import { x } from "tinyexec";

import { getCommitsAheadCount, getDefaultBranch, softReset } from "./squash";

vi.mock("tinyexec");

describe("getDefaultBranch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return the stripped remote branch ref", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "refs/remotes/origin/main\n",
    });

    await expect(getDefaultBranch()).resolves.toBe("origin/main");
  });

  it("should handle non-main default branches", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "refs/remotes/origin/develop\n",
    });

    await expect(getDefaultBranch()).resolves.toBe("origin/develop");
  });

  it("should fall back to origin/main on failure", async () => {
    vi.mocked(x).mockRejectedValue(new Error("fatal: no such ref"));

    await expect(getDefaultBranch()).resolves.toBe("origin/main");
  });

  it("should call git with correct arguments", async () => {
    const mockX = vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "refs/remotes/origin/main\n",
    });

    await getDefaultBranch();

    expect(mockX).toHaveBeenCalledWith(
      "git",
      ["symbolic-ref", "refs/remotes/origin/HEAD"],
      { throwOnError: true },
    );
  });
});

describe("getCommitsAheadCount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return the number of commits ahead", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "5\n",
    });

    await expect(getCommitsAheadCount("origin/main")).resolves.toBe(5);
  });

  it("should handle zero commits ahead", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "0\n",
    });

    await expect(getCommitsAheadCount("origin/main")).resolves.toBe(0);
  });

  it("should throw when git command fails", async () => {
    vi.mocked(x).mockRejectedValue(new Error("fatal: bad revision"));

    await expect(getCommitsAheadCount("origin/main")).rejects.toThrow(
      'Unable to determine commits ahead of "origin/main". Use --count to specify manually.',
    );
  });

  it("should throw when stdout is not a valid number", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "foo\n",
    });

    await expect(getCommitsAheadCount("origin/main")).rejects.toThrow(
      'Unable to determine commits ahead of "origin/main". Use --count to specify manually.',
    );
  });

  it("should call git with correct arguments", async () => {
    const mockX = vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "3\n",
    });

    await getCommitsAheadCount("origin/main");

    expect(mockX).toHaveBeenCalledWith(
      "git",
      ["rev-list", "--count", "HEAD", "^origin/main"],
      { throwOnError: true },
    );
  });
});

describe("softReset", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call git reset --soft with correct count", async () => {
    const mockX = vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "",
    });

    await softReset(3);

    expect(mockX).toHaveBeenCalledWith("git", ["reset", "--soft", "HEAD~3"]);
  });

  it("should no-op when dryRun is true", async () => {
    const mockX = vi.mocked(x);

    await softReset(3, true);

    expect(mockX).not.toHaveBeenCalled();
  });

  it("should throw on non-zero exit code", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 128,
      stderr: "fatal: error",
      stdout: "",
    });

    await expect(softReset(3)).rejects.toThrow("git reset failed (exit 128)");
  });

  it("should use stdout in error message when stderr is empty", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 128,
      stderr: "",
      stdout: "fatal: something\n",
    });

    await expect(softReset(3)).rejects.toThrow(
      "git reset failed (exit 128): fatal: something",
    );
  });

  it("should throw on invalid count", async () => {
    await expect(softReset(0)).rejects.toThrow(
      "softReset count must be a positive integer, got 0",
    );
  });
});
