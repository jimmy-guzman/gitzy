import { x } from "tinyexec";

import { createBranch, getCurrentBranch, renameBranch } from "./branch";

vi.mock("tinyexec");

describe("getCurrentBranch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return the current branch name", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "feat/my-branch\n",
    });

    const result = await getCurrentBranch();

    expect(result).toBe("feat/my-branch");
    expect(x).toHaveBeenCalledWith("git", ["branch", "--show-current"], {
      throwOnError: true,
    });
  });
});

describe("renameBranch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return dry-run result without executing git branch -m", async () => {
    vi.mocked(x)
      .mockResolvedValueOnce({
        exitCode: 0,
        stderr: "",
        stdout: "old-branch\n",
      })
      .mockResolvedValueOnce({ exitCode: 1, stderr: "", stdout: "" });

    const result = await renameBranch("new-branch", { dryRun: true });

    expect(result).toStrictEqual({
      hasRemote: false,
      newName: "new-branch",
      oldName: "old-branch",
    });
    expect(x).toHaveBeenCalledTimes(2);
  });

  it("should rename branch and return result", async () => {
    vi.mocked(x)
      .mockResolvedValueOnce({
        exitCode: 0,
        stderr: "",
        stdout: "old-branch\n",
      })
      .mockResolvedValueOnce({ exitCode: 1, stderr: "", stdout: "" })
      .mockResolvedValueOnce({ exitCode: 0, stderr: "", stdout: "" });

    const result = await renameBranch("new-branch");

    expect(result).toStrictEqual({
      hasRemote: false,
      newName: "new-branch",
      oldName: "old-branch",
    });
    expect(x).toHaveBeenCalledWith(
      "git",
      ["branch", "-m", "old-branch", "new-branch"],
      { nodeOptions: { stdio: "inherit" } },
    );
  });

  it("should detect remote tracking ref", async () => {
    vi.mocked(x)
      .mockResolvedValueOnce({
        exitCode: 0,
        stderr: "",
        stdout: "old-branch\n",
      })
      .mockResolvedValueOnce({ exitCode: 0, stderr: "", stdout: "origin\n" })
      .mockResolvedValueOnce({ exitCode: 0, stderr: "", stdout: "" });

    const result = await renameBranch("new-branch");

    expect(result.hasRemote).toBe(true);
  });

  it("should exit on git branch -m failure", async () => {
    vi.mocked(x)
      .mockResolvedValueOnce({
        exitCode: 0,
        stderr: "",
        stdout: "old-branch\n",
      })
      .mockResolvedValueOnce({ exitCode: 1, stderr: "", stdout: "" })
      .mockResolvedValueOnce({ exitCode: 128, stderr: "error", stdout: "" });

    const exitSpy = vi
      .spyOn(process, "exit")
      .mockReturnValue(undefined as never);

    try {
      await renameBranch("new-branch");

      expect(exitSpy).toHaveBeenCalledWith(128);
    } finally {
      exitSpy.mockRestore();
    }
  });
});

describe("createBranch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return dry-run result without executing git", async () => {
    const result = await createBranch("feat/my-branch", true, true);

    expect(result).toStrictEqual({ branchName: "feat/my-branch" });
    expect(x).not.toHaveBeenCalled();
  });

  it("should checkout new branch when checkout is true", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["checkout", "-b", "feat/my-branch"],
      { nodeOptions: { stdio: "inherit" } },
    );
  });

  it("should create branch without checkout when checkout is false", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch", false);

    expect(x).toHaveBeenCalledWith("git", ["branch", "feat/my-branch"], {
      nodeOptions: { stdio: "inherit" },
    });
  });

  it("should checkout new branch from a base ref", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch", true, false, "main");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["checkout", "-b", "feat/my-branch", "main"],
      { nodeOptions: { stdio: "inherit" } },
    );
  });

  it("should create branch without checkout from a base ref", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch", false, false, "main");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["branch", "feat/my-branch", "main"],
      { nodeOptions: { stdio: "inherit" } },
    );
  });

  it("should exit on git failure", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 1,
      stderr: "error",
      stdout: "",
    });

    const exitSpy = vi
      .spyOn(process, "exit")
      .mockReturnValue(undefined as never);

    try {
      await createBranch("feat/my-branch");

      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
    }
  });
});
