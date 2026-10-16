import { builtinTypes, defaultResolvedConfig } from "@/core/config/defaults";
import { formatMessageResult } from "@/core/conventional/message";
import { defaultMessageParts } from "@/core/conventional/types";

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

  it("should parse comma-separated issue references on one line", () => {
    const result = parseConventionalCommit(
      "fix: resolve bug\n\n🏁 Closes #1, Closes #2, Closes #3"
    );

    expect(result).toStrictEqual({
      issues: ["#1", "#2", "#3"],
      subject: "resolve bug",
      type: "fix",
    });
  });

  it("should reject a comma-separated line with a fake issue reference", () => {
    const result = parseConventionalCommit(
      "fix: resolve bug\n\nCloses #1, Fixes windows-10"
    );

    expect(result).toStrictEqual({
      body: "Closes #1, Fixes windows-10",
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

  it("should capture a Co-authored-by trailer", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nCo-authored-by: A <a@b.c>"
    );

    expect(result).toStrictEqual({
      coAuthors: ["A <a@b.c>"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should capture every Co-authored-by trailer alongside Signed-off-by", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nThis is the body.\n\nCo-authored-by: A <a@b.c>\nCo-authored-by: C <c@d.e>\nSigned-off-by: B <b@c.d>"
    );

    expect(result).toStrictEqual({
      body: "This is the body.",
      coAuthors: ["A <a@b.c>", "C <c@d.e>"],
      signoff: "B <b@c.d>",
      subject: "thing",
      type: "fix",
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

  it("should keep a body paragraph starting with Fixes as body, not an issue", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nFixes the race where x.\nMore text.\n\nCloses #3"
    );

    expect(result).toStrictEqual({
      body: "Fixes the race where x.\nMore text.",
      issues: ["#3"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should keep a body paragraph starting with Closes as body", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nCloses enough to call it done.\n\nFixes #4"
    );

    expect(result).toStrictEqual({
      body: "Closes enough to call it done.",
      issues: ["#4"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should keep a body paragraph starting with Resolves as body", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nResolves nothing without context.\n\nResolves #5"
    );

    expect(result).toStrictEqual({
      body: "Resolves nothing without context.",
      issues: ["#5"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should only treat Closes/Fixes/Resolves as a footer with a real issue ref", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nCloses the loop on retries."
    );

    expect(result).toStrictEqual({
      body: "Closes the loop on retries.",
      subject: "thing",
      type: "fix",
    });
  });

  it("should parse an org/repo#123 issue reference", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nCloses acme/widgets#42"
    );

    expect(result).toStrictEqual({
      issues: ["acme/widgets#42"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should parse an issue URL", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nCloses https://github.com/acme/widgets/issues/42"
    );

    expect(result).toStrictEqual({
      issues: ["https://github.com/acme/widgets/issues/42"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should parse a Jira-style issue key", () => {
    const result = parseConventionalCommit("fix: thing\n\nFixes PROJ-123");

    expect(result).toStrictEqual({
      issues: ["PROJ-123"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should not treat a lowercase word-dash-digits token as a Jira key", () => {
    const result = parseConventionalCommit("fix: thing\n\nFixes task-1");

    expect(result).toStrictEqual({
      body: "Fixes task-1",
      subject: "thing",
      type: "fix",
    });
  });

  it("should parse Closes/Fixes/Resolves followed by a colon", () => {
    const result = parseConventionalCommit("fix: thing\n\nCloses: #123");

    expect(result).toStrictEqual({
      issues: ["#123"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should keep a wrapped BREAKING CHANGE footer's continuation lines", () => {
    const result = parseConventionalCommit(
      "feat!: thing\n\nBREAKING CHANGE: removes the old API and callers\n  must switch to the new one before upgrading."
    );

    expect(result).toStrictEqual({
      breaking:
        "removes the old API and callers\n  must switch to the new one before upgrading.",
      subject: "thing",
      type: "feat",
    });
  });

  it("should keep an indented body paragraph with no footer anchor as body", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\nNormal body text.\n  indented continuation that is not a footer"
    );

    expect(result).toStrictEqual({
      body: "Normal body text.\n  indented continuation that is not a footer",
      subject: "thing",
      type: "fix",
    });
  });

  it("should keep a wholly indented body paragraph with no anchor as body", () => {
    const result = parseConventionalCommit(
      "fix: thing\n\n  a quoted snippet\n  another indented line"
    );

    expect(result).toStrictEqual({
      body: "a quoted snippet\n  another indented line",
      subject: "thing",
      type: "fix",
    });
  });

  it("should extract a lowercase breaking change footer", () => {
    const result = parseConventionalCommit(
      "feat!: thing\n\nbreaking change: removes the old API"
    );

    expect(result).toStrictEqual({
      breaking: "removes the old API",
      subject: "thing",
      type: "feat",
    });
  });

  it("should strip a compound ZWJ emoji from the subject", () => {
    const result = parseConventionalCommit("feat: 👩‍💻 pairing session");

    expect(result).toStrictEqual({
      subject: "pairing session",
      type: "feat",
    });
  });

  it("should parse a type with digits and dashes, no scope", () => {
    const result = parseConventionalCommit("feat-ui: thing");

    expect(result).toStrictEqual({
      subject: "thing",
      type: "feat-ui",
    });
  });

  it("should parse a type with digits and dashes, with scope", () => {
    const result = parseConventionalCommit("feat-ui(x): thing");

    expect(result).toStrictEqual({
      scope: "x",
      subject: "thing",
      type: "feat-ui",
    });
  });

  it("should parse a type that is just a digit-suffixed word, no scope", () => {
    const result = parseConventionalCommit("v2: thing");

    expect(result).toStrictEqual({
      subject: "thing",
      type: "v2",
    });
  });

  it("should parse a type that is just a digit-suffixed word, with scope", () => {
    const result = parseConventionalCommit("v2(core): thing");

    expect(result).toStrictEqual({
      scope: "core",
      subject: "thing",
      type: "v2",
    });
  });

  it("should parse an uppercase type, no scope", () => {
    const result = parseConventionalCommit("WIP: thing");

    expect(result).toStrictEqual({
      subject: "thing",
      type: "WIP",
    });
  });

  it("should parse an uppercase type, with scope", () => {
    const result = parseConventionalCommit("WIP(core): thing");

    expect(result).toStrictEqual({
      scope: "core",
      subject: "thing",
      type: "WIP",
    });
  });

  it.each(builtinTypes)(
    "should strip the $name type's emoji from the subject",
    ({ name }) => {
      const { header } = formatMessageResult(
        defaultResolvedConfig,
        { ...defaultMessageParts, subject: "speed up", type: name },
        true
      );

      expect(parseConventionalCommit(header)).toStrictEqual({
        subject: "speed up",
        type: name,
      });
    }
  );

  it("should strip the default breaking emoji from the BREAKING CHANGE footer", () => {
    const { message } = formatMessageResult(
      defaultResolvedConfig,
      {
        ...defaultMessageParts,
        breaking: "removes old API",
        subject: "thing",
        type: "feat",
      },
      true
    );

    expect(parseConventionalCommit(message)).toStrictEqual({
      breaking: "removes old API",
      subject: "thing",
      type: "feat",
    });
  });

  it("should strip the default issues emoji from the issues footer", () => {
    const { message } = formatMessageResult(
      defaultResolvedConfig,
      {
        ...defaultMessageParts,
        issues: ["#123"],
        subject: "thing",
        type: "fix",
      },
      true
    );

    expect(parseConventionalCommit(message)).toStrictEqual({
      issues: ["#123"],
      subject: "thing",
      type: "fix",
    });
  });

  it("should round-trip multiple issues formatted on one comma-separated line", () => {
    const { message } = formatMessageResult(
      defaultResolvedConfig,
      {
        ...defaultMessageParts,
        issues: ["#1", "#2", "#3"],
        subject: "thing",
        type: "fix",
      },
      true
    );

    expect(parseConventionalCommit(message)).toStrictEqual({
      issues: ["#1", "#2", "#3"],
      subject: "thing",
      type: "fix",
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
