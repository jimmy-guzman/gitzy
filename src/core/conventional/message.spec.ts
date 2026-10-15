import { writeFileSync } from "node:fs";

import { defaultResolvedConfig } from "@/core/config/defaults";
import type { ResolvedConfig } from "@/core/config/types";
import type { MessageParts } from "@/core/conventional/types";
import { defaultMessageParts } from "@/core/conventional/types";
import { git, useTempGitRepo } from "@/core/git/test-utils";

import { formatMessageResult, wrap } from "./message";

const setupFormatCommitMessage = (
  config: Partial<ResolvedConfig> = {},
  answers = {}
) =>
  formatMessageResult(
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
    true
  ).message;

const setupFormatMessageResult = (
  configOverrides: Partial<ResolvedConfig> = {},
  partsOverrides: Partial<MessageParts> = {},
  emoji = true
) =>
  formatMessageResult(
    { ...defaultResolvedConfig, ...configOverrides },
    { ...defaultMessageParts, breaking: "", coAuthors: [], ...partsOverrides },
    emoji
  );

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
      }
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
      }
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

  it("should format two issues as array", () => {
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
      }
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
      `"feat(*): ✨ this has "quotes""`
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
      `"feat(*): ✨ this has \`quotes\`"`
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
      }
    );

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this is a very very very very very very very very very subject"`
    );
    expect(formattedMessage).toHaveLength(73);
  });

  it("should never wrap the header, even when it exceeds header.max", () => {
    const formattedMessage = setupFormatCommitMessage(
      { header: { max: 71, min: 3 } },
      {
        body: "",
        breaking: "",
        issues: [],
        subject:
          "this is a very very very very very very very very very subject",
      }
    );

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this is a very very very very very very very very very subject"`
    );
    expect(formattedMessage).not.toContain("\n");
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
      }
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
    const formattedMessage = formatMessageResult(
      defaultResolvedConfig,
      {
        body: "this an amazing feature, lots of details",
        breaking: "breaks everything",
        issues: ["#123"],
        scope: "*",
        subject: "a cool new `feature`",
        type: "feat",
      },
      true
    ).message;

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new \`feature\`

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should not crash when parts.type is empty (not in config.types)", () => {
    const result = formatMessageResult(
      defaultResolvedConfig,
      defaultMessageParts,
      true
    ).message;

    expect(result).toMatchInlineSnapshot(`": "`);
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
      }
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

  it("should include Signed-off-by footer when signoff is a string", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      signoff: "Jane Doe <jane@example.com>",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123

      Signed-off-by: Jane Doe <jane@example.com>"
    `);
  });

  it("should NOT include Signed-off-by footer when signoff is an unresolved boolean", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      signoff: true,
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123"
    `);
  });

  it("should NOT include Signed-off-by footer when signoff is omitted", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      breaking: "",
      issues: [],
      signoff: false,
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details"
    `);
  });

  it("should group co-authors and Signed-off-by into one trailer paragraph", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      coAuthors: ["Alice <alice@example.com>", "Bob <bob@example.com>"],
      signoff: "Jane Doe <jane@example.com>",
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123

      Co-authored-by: Alice <alice@example.com>
      Co-authored-by: Bob <bob@example.com>
      Signed-off-by: Jane Doe <jane@example.com>"
    `);
  });

  it("should not wrap long co-author trailers", () => {
    const formattedMessage = setupFormatCommitMessage(defaultResolvedConfig, {
      breaking:
        "the config file format changed and every existing config must be migrated by hand",
      coAuthors: [
        "Jane Q. Developer-Longname <jane.developer-longname@some-company.example.com>",
      ],
    });

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 the config file format changed and every existing
      config must be migrated by hand

      🏁 Closes #123

      Co-authored-by: Jane Q. Developer-Longname <jane.developer-longname@some-company.example.com>"
    `);
  });
});

describe("git trailers", () => {
  useTempGitRepo();

  it("should parse every co-author and Signed-off-by as a git trailer", async () => {
    const { message } = setupFormatMessageResult(
      {},
      {
        breaking: "breaks everything",
        coAuthors: [
          "Alice <alice@example.com>",
          "Jane Q. Developer-Longname <jane.developer-longname@some-company.example.com>",
        ],
        issues: ["#123"],
        signoff: "Jane Doe <jane@example.com>",
        subject: "add thing",
        type: "feat",
      }
    );

    writeFileSync("COMMIT_EDITMSG", message);

    await expect(git("interpret-trailers", "--parse", "COMMIT_EDITMSG"))
      .resolves.toMatchInlineSnapshot(`
      "Co-authored-by: Alice <alice@example.com>
      Co-authored-by: Jane Q. Developer-Longname <jane.developer-longname@some-company.example.com>
      Signed-off-by: Jane Doe <jane@example.com>"
    `);
  });
});

describe(formatMessageResult, () => {
  it("should split header, body, and footer into structured result", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "this an amazing feature, lots of details",
        breaking: "breaks everything",
        issues: ["#123"],
        scope: "*",
        subject: "a cool new feature",
        type: "feat",
      }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "body": "this an amazing feature, lots of details",
        "footer": "BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123",
        "header": "feat(*): ✨ a cool new feature",
        "message": "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes #123",
        "parts": {
          "body": "this an amazing feature, lots of details",
          "breaking": "breaks everything",
          "coAuthors": [],
          "issues": [
            "#123",
          ],
          "scope": "*",
          "subject": "a cool new feature",
          "type": "feat",
        },
      }
    `);
  });

  it("should return empty body and footer for header-only message", () => {
    const result = setupFormatMessageResult(
      {},
      {
        subject: "quick fix",
        type: "fix",
      }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "body": "",
        "footer": "",
        "header": "fix: 🐛 quick fix",
        "message": "fix: 🐛 quick fix",
        "parts": {
          "body": "",
          "breaking": "",
          "coAuthors": [],
          "issues": [],
          "scope": "",
          "subject": "quick fix",
          "type": "fix",
        },
      }
    `);
  });

  it("should correctly split when emoji is disabled", () => {
    const result = setupFormatMessageResult(
      { emoji: { breaking: "💥", enabled: false, issues: "🏁" } },
      {
        body: "a description",
        breaking: "breaks everything",
        issues: ["#42"],
        subject: "a feature",
        type: "feat",
      },
      false
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "body": "a description",
        "footer": "BREAKING CHANGE: breaks everything

      Closes #42",
        "header": "feat: a feature",
        "message": "feat: a feature

      a description

      BREAKING CHANGE: breaks everything

      Closes #42",
        "parts": {
          "body": "a description",
          "breaking": "breaks everything",
          "coAuthors": [],
          "issues": [
            "#42",
          ],
          "scope": "",
          "subject": "a feature",
          "type": "feat",
        },
      }
    `);
  });

  it("should correctly split with custom issues prefix", () => {
    const result = setupFormatMessageResult(
      { issues: { ...defaultResolvedConfig.issues, prefix: "fixes" } },
      {
        issues: ["#100", "#200"],
        subject: "fix bugs",
        type: "fix",
      }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "body": "",
        "footer": "🏁 Fixes #100, Fixes #200",
        "header": "fix: 🐛 fix bugs",
        "message": "fix: 🐛 fix bugs

      🏁 Fixes #100, Fixes #200",
        "parts": {
          "body": "",
          "breaking": "",
          "coAuthors": [],
          "issues": [
            "#100",
            "#200",
          ],
          "scope": "",
          "subject": "fix bugs",
          "type": "fix",
        },
      }
    `);
  });

  it("should correctly split multi-paragraph body with co-authors", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "first paragraph\n\nsecond paragraph",
        coAuthors: ["Alice <alice@example.com>"],
        subject: "complex commit",
        type: "chore",
      }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "body": "first paragraph

      second paragraph",
        "footer": "Co-authored-by: Alice <alice@example.com>",
        "header": "chore: 🤖 complex commit",
        "message": "chore: 🤖 complex commit

      first paragraph

      second paragraph

      Co-authored-by: Alice <alice@example.com>",
        "parts": {
          "body": "first paragraph

      second paragraph",
          "breaking": "",
          "coAuthors": [
            "Alice <alice@example.com>",
          ],
          "issues": [],
          "scope": "",
          "subject": "complex commit",
          "type": "chore",
        },
      }
    `);
  });

  it("should classify Signed-off-by as footer", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "a description",
        signoff: "Jane Doe <jane@example.com>",
        subject: "a feature",
        type: "feat",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`"a description"`);
    expect(result.footer).toMatchInlineSnapshot(
      `"Signed-off-by: Jane Doe <jane@example.com>"`
    );
  });

  it("should wrap a long bullet item with a hanging indent", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "- this bullet item is long enough that it has to wrap onto a second line of the body",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "- this bullet item is long enough that it has to wrap onto a second line
        of the body"
    `);
  });

  it("should wrap a long numbered item with a hanging indent", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "1. this numbered item is long enough that it has to wrap onto a second line of the body",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "1. this numbered item is long enough that it has to wrap onto a second
         line of the body"
    `);
  });

  it("should leave fenced code blocks untouched", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "```ts\nconst result = formatMessageResult(config, parts, emoji) ?? fallbackValue;\n```",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "\`\`\`ts
      const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;
      \`\`\`"
    `);
  });

  it("should not treat a backtick line inside an indented block as a fence", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "    ```\n\nthis prose comes after the indented block and is long enough that it has to wrap",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "    \`\`\`

      this prose comes after the indented block and is long enough that it has
      to wrap"
    `);
  });

  it("should keep the indent of a list item continuation line", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "- item\n  this continuation line is long enough that it has to wrap onto another line",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "- item
        this continuation line is long enough that it has to wrap onto another
        line"
    `);
  });

  it("should not throw when a list marker is followed by a run of spaces", () => {
    const result = setupFormatMessageResult(
      {},
      { body: `-${" ".repeat(72)}text` }
    );

    expect(result.body).toBe(`-${" ".repeat(71)}\n     text`);
  });

  it("should leave code inside a four-backtick fence untouched", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "````md\nconst result = formatMessageResult(config, parts, emoji) ?? fallbackValue;\n````",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "\`\`\`\`md
      const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;
      \`\`\`\`"
    `);
  });

  it("should not close a four-backtick fence on a nested triple-backtick fence", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "````md\n```ts\nconst result = formatMessageResult(config, parts, emoji) ?? fallbackValue;\n```\n````",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "\`\`\`\`md
      \`\`\`ts
      const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;
      \`\`\`
      \`\`\`\`"
    `);
  });

  it("should leave a tilde-fenced code block untouched", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "~~~ts\nconst result = formatMessageResult(config, parts, emoji) ?? fallbackValue;\n~~~",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "~~~ts
      const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;
      ~~~"
    `);
  });

  it("should allow a backtick in a tilde fence's info string", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "~~~ts `inline`\nconst result = formatMessageResult(config, parts, emoji) ?? fallbackValue;\n~~~",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "~~~ts \`inline\`
      const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;
      ~~~"
    `);
  });

  it("should not close a tilde fence on a nested backtick fence", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "~~~md\n```ts\nconst result = formatMessageResult(config, parts, emoji) ?? fallbackValue;\n```\n~~~",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "~~~md
      \`\`\`ts
      const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;
      \`\`\`
      ~~~"
    `);
  });

  it("should leave indented code blocks untouched", () => {
    const result = setupFormatMessageResult(
      {},
      {
        body: "example:\n\n    const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;",
      }
    );

    expect(result.body).toMatchInlineSnapshot(`
      "example:

          const result = formatMessageResult(config, parts, emoji) ?? fallbackValue;"
    `);
  });
});

describe(wrap, () => {
  it("should wrap", () => {
    const wrappedString = wrap(
      `feat(*): ✨ this is a very very very very very very very very very subject`
    );

    expect(wrappedString).toMatchInlineSnapshot(`
        "feat(*): ✨ this is a very very very very very very very very very
        subject"
      `);
    expect(wrappedString.split("\n")[0]).toHaveLength(65);
  });
});
