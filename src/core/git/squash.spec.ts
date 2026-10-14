import { writeFileSync } from "node:fs";

import {
  checkCanSquash,
  countCommitsAhead,
  getDefaultBranch,
  softReset,
} from "./squash";
import { git, useTempGitRepo } from "./test-utils";

const addCommit = async (name: string) => {
  writeFileSync(name, name);
  await git("add", name);
  await git("commit", "--message", `feat: add ${name}`);
};

useTempGitRepo();

describe(getDefaultBranch, () => {
  it("should fall back to origin/main without a remote HEAD", async () => {
    await expect(getDefaultBranch()).resolves.toBe("origin/main");
  });

  it("should return the remote HEAD branch", async () => {
    await git("update-ref", "refs/remotes/origin/trunk", "HEAD");
    await git(
      "symbolic-ref",
      "refs/remotes/origin/HEAD",
      "refs/remotes/origin/trunk"
    );

    await expect(getDefaultBranch()).resolves.toBe("origin/trunk");
  });
});

describe(countCommitsAhead, () => {
  it("should count commits ahead of the base", async () => {
    await git("checkout", "-b", "feat/squash");
    await addCommit("a");
    await addCommit("b");
    await addCommit("c");

    await expect(countCommitsAhead("main")).resolves.toBe(3);
  });

  it("should throw when the base does not exist", async () => {
    await expect(countCommitsAhead("origin/main")).rejects.toThrow(
      "Unable to determine commits ahead of origin/main. Use --count to set it."
    );
  });
});

describe(checkCanSquash, () => {
  it("should pass when there is history to reset onto", async () => {
    await addCommit("a");
    await addCommit("b");

    await expect(checkCanSquash(2)).resolves.toBeUndefined();
  });

  it("should throw when the count reaches past the root commit", async () => {
    await addCommit("a");

    await expect(checkCanSquash(2)).rejects.toThrow(
      "Unable to squash 2 commits: not enough history before HEAD"
    );
  });
});

describe(softReset, () => {
  it("should remove the commits and keep their changes staged", async () => {
    await addCommit("a");
    await addCommit("b");

    await softReset(2);

    await expect(git("log", "--format=%s")).resolves.toBe("chore: init");
    await expect(git("diff", "--cached", "--name-only")).resolves.toBe("a\nb");
  });

  it("should throw when there are not enough commits", async () => {
    await expect(softReset(5)).rejects.toThrow(
      "Unable to squash 5 commits (git reset failed)"
    );
  });
});
