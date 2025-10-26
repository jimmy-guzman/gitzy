import { defaultConfig } from "@/defaults/config";

import { formatMessage, wrap } from "./messages";

const setupFormatCommitMessage = (config = {}, answers = {}): string => {
  return formatMessage(
    { ...defaultConfig, ...config },
    {
      body: "this an amazing feature, lots of details",
      breaking: "breaks everything",
      issues: "#123",
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

      🏁 Closes: #123"
    `);
  });

  it("should format commit message with no emojis", () => {
    const formattedMessage = setupFormatCommitMessage({ disableEmoji: true });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: breaks everything

      Closes: #123"
    `);
  });

  it("should format commit message with no body", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `);
  });

  it("should format commit message with multiline body", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: "\n",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `);
  });

  it("should format commit message with no scope", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      scope: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat: ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `);
  });

  it("should format commit message with no issues", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      issues: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything"
    `);
  });

  it("should format commit message with no breaking change", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      breaking: "",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      🏁 Closes: #123"
    `);
  });

  it("should wrap commit message", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
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

      🏁 Closes: #123"
    `);
  });

  it("should wrap commit message correctly when there are quotes and back ticks", () => {
    const formattedMessage = setupFormatCommitMessage(
      { ...defaultConfig, headerMaxLength: 75 },
      {
        subject:
          "reduce deps by replacing `cosmiconfig` w/ `lilconfig` & `yaml`",
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ reduce deps by replacing \`cosmiconfig\` w/ \`lilconfig\` & \`yaml\`

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `);
  });

  it("should allow double quotes in message", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: "",
      breaking: "",
      issues: "",
      subject: 'this has "quotes"',
    });

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this has "quotes""`,
    );
  });

  it("should allow backtick quotes in message", () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: "",
      breaking: "",
      issues: "",
      subject: "this has `quotes`",
    });

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this has \`quotes\`"`,
    );
  });

  it("should not wrap message when headerMaxLength is longer than the default width (72)", () => {
    const formattedMessage = setupFormatCommitMessage(
      { ...defaultConfig, headerMaxLength: 75 },
      {
        body: "",
        breaking: "",
        issues: "",
        subject:
          "this is a very very very very very very very very very subject",
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this is a very very very very very very very very very subject"`,
    );
    expect(formattedMessage).toHaveLength(73);
  });

  it("should leverage default width (72) when headerMaxLength is less", () => {
    const formattedMessage = setupFormatCommitMessage(
      { ...defaultConfig, headerMaxLength: 71 },
      {
        body: "",
        breaking: "",
        issues: "",
        subject:
          "this is a very very very very very very very very very subject", // This is intentionally longer than headerMaxLength
      },
    );

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ this is a very very very very very very very very very
      subject"
    `);
    expect(formattedMessage.split("\n")[0]).toHaveLength(65);
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

  it("should format correctly when in hook mode", () => {
    const formattedMessage = formatMessage(
      defaultConfig,
      {
        body: "this an amazing feature, lots of details",
        breaking: "breaks everything",
        issues: "#123",
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

      🏁 Closes: #123"
    `);
  });
});
