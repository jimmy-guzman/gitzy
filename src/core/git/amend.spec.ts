import {
  getAmendParts,
  getHeadCommitMessage,
  parseConventionalCommit,
} from "./amend";
import { git, useTempGitRepo } from "./test-utils";

describe(parseConventionalCommit, () => {
  it("should parse a basic commit message", () => {
    const result = parseConventionalCommit("feat: add new feature");

    expect(result).toStrictEqual({
      subject: "add new feature",
      type: "feat",
    });
  });

  it("should parse type and scope", () => {
    const result = parseConventionalCommit("fix(cli): resolve crash");

    expect(result).toStrictEqual({
      scope: "cli",
      subject: "resolve crash",
      type: "fix",
    });
  });

  it("should parse breaking change via ! in header", () => {
    const result = parseConventionalCommit("feat!: remove old API");

    expect(result).toStrictEqual({
      breaking: true,
      subject: "remove old API",
      type: "feat",
    });
  });

  it("should parse breaking change via BREAKING CHANGE footer", () => {
    const result = parseConventionalCommit(
      "feat: add feature\n\nBREAKING CHANGE: removes old API"
    );

    expect(result).toStrictEqual({
      breaking: "removes old API",
      subject: "add feature",
      type: "feat",
    });
  });

  it("should strip leading emoji from subject", () => {
    const result = parseConventionalCommit("feat: ✨ add new feature");

    expect(result).toStrictEqual({
      subject: "add new feature",
      type: "feat",
    });
  });

  it("should parse body text", () => {
    const result = parseConventionalCommit(
      "feat: add feature\n\nThis is the body text."
    );

    expect(result).toStrictEqual({
      body: "This is the body text.",
      subject: "add feature",
      type: "feat",
    });
  });

  it("should separate body from footer", () => {
    const result = parseConventionalCommit(
      "feat: add feature\n\nThis is the body.\n\nBREAKING CHANGE: breaks everything"
    );

    expect(result).toStrictEqual({
      body: "This is the body.",
      breaking: "breaks everything",
      subject: "add feature",
      type: "feat",
    });
  });

  it("should return partial result for non-conventional message", () => {
    const result = parseConventionalCommit("just a plain commit message");

    expect(result).toStrictEqual({
      subject: "just a plain commit message",
    });
  });

  it("should strip emoji from BREAKING CHANGE footer", () => {
    const result = parseConventionalCommit(
      "feat: add feature\n\nBREAKING CHANGE: 💥 removes old API"
    );

    expect(result).toStrictEqual({
      breaking: "removes old API",
      subject: "add feature",
      type: "feat",
    });
  });

  it("should parse issues from Closes footer", () => {
    const result = parseConventionalCommit(
      "feat: add feature\n\n🏁 Closes #123"
    );

    expect(result).toStrictEqual({
      issues: ["#123"],
      subject: "add feature",
      type: "feat",
    });
  });

  it("should parse multiple issue references", () => {
    const result = parseConventionalCommit(
      "fix: resolve bug\n\nCloses #1\nFixes #2\nResolves #3"
    );

    expect(result).toStrictEqual({
      issues: ["#1", "#2", "#3"],
      subject: "resolve bug",
      type: "fix",
    });
  });

  it("should capture the Signed-off-by signature and keep it out of the body", () => {
    const result = parseConventionalCommit(
      "feat: add feature\n\nThis is the body.\n\nSigned-off-by: Jane Doe <jane@example.com>"
    );

    expect(result).toStrictEqual({
      body: "This is the body.",
      signoff: "Jane Doe <jane@example.com>",
      subject: "add feature",
      type: "feat",
    });
  });

  it("should handle scope with breaking ! indicator", () => {
    const result = parseConventionalCommit(
      "refactor(core)!: rewrite internals\n\nBREAKING CHANGE: new API shape"
    );

    expect(result).toStrictEqual({
      breaking: "new API shape",
      scope: "core",
      subject: "rewrite internals",
      type: "refactor",
    });
  });
});

describe(getHeadCommitMessage, () => {
  useTempGitRepo();

  it("should return the trimmed HEAD commit message", async () => {
    await git("commit", "--allow-empty", "--message", "feat: add feature\n");

    await expect(getHeadCommitMessage()).resolves.toBe("feat: add feature");
  });
});

describe(getAmendParts, () => {
  useTempGitRepo();

  it("should return parsed parts from HEAD commit", async () => {
    await git("commit", "--allow-empty", "--message", "feat(cli): add flag");

    await expect(getAmendParts()).resolves.toStrictEqual({
      scope: "cli",
      subject: "add flag",
      type: "feat",
    });
  });

  it("should return empty object when git command fails", async () => {
    await git("checkout", "--orphan", "empty");

    await expect(getAmendParts()).resolves.toStrictEqual({});
  });
});
