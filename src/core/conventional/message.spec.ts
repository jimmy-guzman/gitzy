import type { ResolvedConfig } from "@/core/config/types";

import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { formatMessage, wrap } from "./message";

const setupFormatCommitMessage = (
  config: Partial<ResolvedConfig> = {},
  answers = {},
): string => {
  return formatMessage(
    { ...defaultResolvedConfig, ...config },
    {
      body: "this an amazing feature, lots of details",
      breaking: "breaks everything",
      issues: ["#123"],
      scope: "*",
      subject: "a cool new feature",
      type: "feat",
      ...answers,
    },
    true,
  );
};

describe("formatCommitMessage", () => {
  it("should format commit message with everything", () => {
    const formattedMessage = setupFormatCommitMessage();

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should format commit message with no emojis", () => {
    const formattedMessage = setupFormatCommitMessage({
      emoji: { breaking: "💥", enabled: false, issues: "🏁" },
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: breaks everything

      Closes #123"
    `);
  });

  it("should format commit message with no body", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      body: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should format commit message with multiline body", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      body: "\n",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should format commit message with no scope", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      scope: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat: ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should format commit message with no issues", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: [],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything"
    `);
  });

  it("should format commit message with no breaking change", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      breaking: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      🏁 Closes #123"
    `);
  });

  it("should format commit message with multiple issues", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["#123", "#456", "#789"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456, Closes #789"
    `);
  });

  it("should format commit message with multiple issues using full syntax", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["resolves #10", "fixes #123", "closes #456"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Resolves #10, Fixes #123, Closes #456"
    `);
  });

  it("should format commit message with cross-repo issues", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["octo-org/octo-repo#100"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes octo-org/octo-repo#100"
    `);
  });

  it("should format commit message with mixed issue formats", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["resolves #10", "#123", "resolves octo-org/octo-repo#100"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Resolves #10, Closes #123, Resolves octo-org/octo-repo#100"
    `);
  });

  it("should format commit message with multiple issues and no emoji", () => {
    const formattedMessage = setupFormatCommitMessage(
      { emoji: { breaking: "💥", enabled: false, issues: "🏁" } },
      {
        issues: ["resolves #10", "resolves #123"],
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: breaks everything

      Resolves #10, Resolves #123"
    `);
  });

  it("should format commit message with custom issues prefix", () => {
    const formattedMessage = setupFormatCommitMessage(
      {
        issues: {
          ...defaultResolvedConfig.issues,
          prefix: "fixes",
        },
      },
      {
        issues: ["#123", "#456"],
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Fixes #123, Fixes #456"
    `);
  });

  it("should handle whitespace tolerance in issues", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["  #123 ", " #456  ", "#789  "],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456, Closes #789"
    `);
  });

  it("should handle issues with excessive whitespace", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["#123", "#456", "#789"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456, Closes #789"
    `);
  });

  it("should handle empty issues after filtering whitespace", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["#123", "", "#456"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456"
    `);
  });

  it("should handle issues without spaces after commas", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["#123", "#456", "#789"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456, Closes #789"
    `);
  });

  it("should handle issues with multiple spaces around commas", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["#123", "#456"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456"
    `);
  });

  it("should handle mixed spacing around commas", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      issues: ["#123", "#456", "#789"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123, Closes #456, Closes #789"
    `);
  });

  it("should wrap commit message", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      body: "this is a very very very very very very very very very very very very very very very very very very very long description",
      breaking:
        "this is a very very very very very very very very very very very very very very very very very very very long breaking change",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this is a very very very very very very very very very very very very
      very very very very very very very long description

      BREAKING CHANGE: 💥 this is a very very very very very very very very
      very very very very very very very very very very very long breaking
      change

      🏁 Closes #123"
    `);
  });

  it("should wrap commit message correctly when there are quotes and back ticks", () => {
    const formattedMessage = setupFormatCommitMessage(
      { header: { max: 75, min: 3 } },
      {
        subject:
          "reduce deps by replacing `cosmiconfig` w/ `lilconfig` & `yaml`",
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ reduce deps by replacing \`cosmiconfig\` w/ \`lilconfig\` & \`yaml\`

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should allow double quotes in message", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      body: "",
      breaking: "",
      issues: [],
      subject: 'this has "quotes"',
    });

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this has "quotes""`,
    );
  });

  it("should allow backtick quotes in message", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      body: "",
      breaking: "",
      issues: [],
      subject: "this has `quotes`",
    });

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this has \`quotes\`"`,
    );
  });

  it("should not wrap message when header.max is longer than the default width (72)", () => {
    const formattedMessage = setupFormatCommitMessage(
      { header: { max: 75, min: 3 } },
      {
        body: "",
        breaking: "",
        issues: [],
        subject:
          "this is a very very very very very very very very very subject",
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this is a very very very very very very very very very subject"`,
    );
    expect(formattedMessage).toHaveLength(73);
  });

  it("should leverage default width (72) when header.max is less", () => {
    const formattedMessage = setupFormatCommitMessage(
      { header: { max: 71, min: 3 } },
      {
        body: "",
        breaking: "",
        issues: [],
        subject:
          "this is a very very very very very very very very very subject", // This is intentionally longer than header.max
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ this is a very very very very very very very very very
      subject"
    `);
    expect(formattedMessage.split("\n")[0]).toHaveLength(65);
  });

  it("should add '!' when breaking.format is '!' and there is a breaking change", () => {
    const formattedMessage = setupFormatCommitMessage({
      breaking: { format: "!" },
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*)!: ✨ a cool new feature

      this an amazing feature, lots of details

      🏁 Closes #123"
    `);
  });

  it("should NOT add '!' when breaking.format is '!' and there is no breaking change", () => {
    const formattedMessage = setupFormatCommitMessage(
      {
        breaking: { format: "!" },
      },
      {
        breaking: false,
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      🏁 Closes #123"
    `);
  });

  it("should add '!' & footer when breaking.format is 'both' and there is a breaking change", () => {
    const formattedMessage = setupFormatCommitMessage({
      breaking: { format: "both" },
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*)!: ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should NOT include BREAKING CHANGE footer when breaking is a boolean", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      breaking: true,
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      🏁 Closes #123"
    `);
  });

  it("should format correctly when in hook mode", () => {
    const formattedMessage = formatMessage(
      defaultResolvedConfig,
      {
        body: "this an amazing feature, lots of details",
        breaking: "breaks everything",
        issues: ["#123"],
        scope: "*",
        subject: "a cool new `feature`",
        type: "feat",
      },
      true,
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new \`feature\`

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should not crash when parts.type is empty (not in config.types)", () => {
    const result = formatMessage(
      defaultResolvedConfig,
      defaultMessageParts,
      true,
    );

    expect(result).toBe(": ");
  });

  it("should format Jira issues without prefix", () => {
    const formattedMessage = setupFormatCommitMessage(
      {
        issues: {
          ...defaultResolvedConfig.issues,
          pattern: "jira",
        },
      },
      {
        issues: ["PROJ-123", "PROJ-456"],
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 PROJ-123, PROJ-456"
    `);
  });

  it("should include co-authors footer", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      coAuthors: ["Alice <alice@example.com>", "Bob <bob@example.com>"],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123

      Co-authored-by: Alice <alice@example.com>

      Co-authored-by: Bob <bob@example.com>"
    `);
  });
});

describe("wrap", () => {
  it("should wrap", () => {
    const wrappedString = wrap(
      `feat(*): ✨ this is a very very very very very very very very very subject`,
    );

    expect(wrappedString).toMatchInlineSnapshot(`
        "feat(*): ✨ this is a very very very very very very very very very
        subject"
      `);
    expect(wrappedString.split("\n")[0]).toHaveLength(65);
  });
});
