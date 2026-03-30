import { x } from "tinyexec";

import { createBranch, getCurrentBranch, renameBranch } from "./branch";

vi.mock("tinyexec");

interface MockResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

const mockX = (...results: MockResult[]) => {
  for (const result of results) {
    vi.mocked(x).mockResolvedValueOnce(result);
  }
};

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
    mockX(
      { exitCode: 0, stderr: "", stdout: "old-branch\n" },
      { exitCode: 1, stderr: "", stdout: "" },
    );

    const result = await renameBranch("new-branch", { dryRun: true });

    expect(result).toStrictEqual({
      hasRemote: false,
      newName: "new-branch",
      oldName: "old-branch",
    });
    expect(x).toHaveBeenCalledTimes(2);
  });

  it("should rename branch and return result", async () => {
    mockX(
      { exitCode: 0, stderr: "", stdout: "old-branch\n" },
      { exitCode: 1, stderr: "", stdout: "" },
      { exitCode: 0, stderr: "", stdout: "" },
    );

    const result = await renameBranch("new-branch");

    expect(result).toStrictEqual({
      hasRemote: false,
      newName: "new-branch",
      oldName: "old-branch",
    });
    expect(x).toHaveBeenCalledWith(
      "git",
      ["branch", "-m", "old-branch", "new-branch"],
      { nodeOptions: { stdio: "pipe" } },
    );
  });

  it("should detect remote tracking ref", async () => {
    mockX(
      { exitCode: 0, stderr: "", stdout: "old-branch\n" },
      { exitCode: 0, stderr: "", stdout: "origin\n" },
      { exitCode: 0, stderr: "", stdout: "" },
    );

    const result = await renameBranch("new-branch");

    expect(result.hasRemote).toBe(true);
  });

  it("should exit on git branch -m failure", async () => {
    mockX(
      { exitCode: 0, stderr: "", stdout: "old-branch\n" },
      { exitCode: 1, stderr: "", stdout: "" },
      { exitCode: 128, stderr: "error", stdout: "" },
    );

    await expect(renameBranch("new-branch")).rejects.toThrowError(
      "git branch -m failed with exit code 128: error",
    );
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
      { nodeOptions: { stdio: "pipe" } },
    );
  });

  it("should create branch without checkout when checkout is false", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch", false);

    expect(x).toHaveBeenCalledWith("git", ["branch", "feat/my-branch"], {
      nodeOptions: { stdio: "pipe" },
    });
  });

  it("should checkout new branch from a base ref", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch", true, false, "main");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["checkout", "-b", "feat/my-branch", "main"],
      { nodeOptions: { stdio: "pipe" } },
    );
  });

  it("should create branch without checkout from a base ref", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await createBranch("feat/my-branch", false, false, "main");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["branch", "feat/my-branch", "main"],
      { nodeOptions: { stdio: "pipe" } },
    );
  });

  it("should exit on git failure", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 1,
      stderr: "error",
      stdout: "",
    });

    await expect(createBranch("feat/my-branch")).rejects.toThrowError(
      "git checkout -b failed with exit code 1: error",
    );
  });
});
