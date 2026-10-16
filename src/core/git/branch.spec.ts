import { createBranch, getCurrentBranch, renameBranch } from "./branch";
import { git, useTempGitRepo } from "./test-utils";

const listBranches = async () =>
  await git("branch", "--format=%(refname:short)");

useTempGitRepo();

describe(getCurrentBranch, () => {
  it("should return the current branch name", async () => {
    await git("checkout", "-b", "feat/my-branch");

    await expect(getCurrentBranch()).resolves.toBe("feat/my-branch");
  });
});

describe(renameBranch, () => {
  it("should return dry-run result without renaming the branch", async () => {
    const result = await renameBranch("new-branch", { dryRun: true });

    expect(result).toStrictEqual({
      hasRemote: false,
      newName: "new-branch",
      oldName: "main",
    });
    await expect(getCurrentBranch()).resolves.toBe("main");
  });

  it("should rename branch and return result", async () => {
    const result = await renameBranch("new-branch");

    expect(result).toStrictEqual({
      hasRemote: false,
      newName: "new-branch",
      oldName: "main",
    });
    await expect(getCurrentBranch()).resolves.toBe("new-branch");
  });

  it("should detect remote tracking ref", async () => {
    await git("config", "branch.main.remote", "origin");

    const result = await renameBranch("new-branch");

    expect(result.hasRemote).toBeTruthy();
  });

  it("should throw on git branch -m failure", async () => {
    await git("branch", "taken");

    await expect(renameBranch("taken")).rejects.toThrow(
      "git branch -m failed with exit code 128: fatal: a branch named 'taken' already exists"
    );
  });

  it("should throw when git rejects the branch name", async () => {
    await expect(renameBranch("bad..name")).rejects.toThrow(
      '"bad..name" is not a valid git branch name'
    );
    await expect(getCurrentBranch()).resolves.toBe("main");
  });
});

describe(createBranch, () => {
  it("should not create the branch on a dry run", async () => {
    await createBranch("feat/my-branch", true, true);

    await expect(listBranches()).resolves.toBe("main");
  });

  it("should throw when git rejects the branch name", async () => {
    await expect(createBranch("feat/a b")).rejects.toThrow(
      '"feat/a b" is not a valid git branch name'
    );
    await expect(listBranches()).resolves.toBe("main");
  });

  it("should throw when git rejects the branch name on a dry run", async () => {
    await expect(createBranch("feat/a.lock", true, true)).rejects.toThrow(
      '"feat/a.lock" is not a valid git branch name'
    );
  });

  it("should checkout new branch when checkout is true", async () => {
    await createBranch("feat/my-branch");

    await expect(getCurrentBranch()).resolves.toBe("feat/my-branch");
  });

  it("should create branch without checkout when checkout is false", async () => {
    await createBranch("feat/my-branch", false);

    await expect(getCurrentBranch()).resolves.toBe("main");
    await expect(listBranches()).resolves.toContain("feat/my-branch");
  });

  it("should checkout new branch from a base ref", async () => {
    await git("branch", "base");
    await git("commit", "--allow-empty", "--message", "chore: ahead");

    await createBranch("feat/my-branch", true, false, "base");

    await expect(getCurrentBranch()).resolves.toBe("feat/my-branch");
    await expect(git("rev-parse", "HEAD")).resolves.toBe(
      await git("rev-parse", "base")
    );
  });

  it("should create branch without checkout from a base ref", async () => {
    await git("branch", "base");
    await git("commit", "--allow-empty", "--message", "chore: ahead");

    await createBranch("feat/my-branch", false, false, "base");

    await expect(getCurrentBranch()).resolves.toBe("main");
    await expect(git("rev-parse", "feat/my-branch")).resolves.toBe(
      await git("rev-parse", "base")
    );
  });

  it("should throw on git failure", async () => {
    await git("branch", "taken");

    await expect(createBranch("taken")).rejects.toThrow(
      "git checkout -b failed with exit code 128: fatal: a branch named 'taken' already exists"
    );
  });
});
