import type { EnquirerChoice } from "@/cli/types";

import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { choice, type } from "./type";

const setupType = (configOverrides = {}) => {
  return type({
    answers: defaultMessageParts,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

const setupChoice = (
  configOverrides = {},
  flags = {},
  currentType = "feat",
): EnquirerChoice => {
  return choice({ ...defaultResolvedConfig, ...configOverrides }, currentType, {
    emoji: true,
    ...flags,
  });
};

describe("choice", () => {
  it("should create a default choice", () => {
    expect(setupChoice()).toStrictEqual({
      hint: "a new feature",
      indent: " ",
      message: "✨ feat:",
      name: "feat",
      title: "✨ feat:",
      value: "feat",
    });
  });

  it("should not have an emoji when emoji.enabled is false", () => {
    const { title } = setupChoice({
      emoji: { ...defaultResolvedConfig.emoji, enabled: false },
    });

    expect(title).toBe("feat:");
  });

  it("should not have an emoji when --no-emoji", () => {
    const { title } = setupChoice({}, { emoji: false });

    expect(title).toBe("feat:");
  });

  it('should NOT add extra space for "refactor"', () => {
    const { title } = setupChoice({}, {}, "refactor");

    expect(title).toBe("🔄 refactor:");
  });

  it("should not crash when type is not in config.types", () => {
    expect(setupChoice({}, {}, "unknown-type")).toStrictEqual({
      hint: "",
      indent: " ",
      message: "unknown-type:",
      name: "unknown-type",
      title: "unknown-type:",
      value: "unknown-type",
    });
  });
});

describe("type", () => {
  it("should return type prompt with default types", () => {
    expect(setupType({ scopes: [{ name: "build" }] })).toMatchInlineSnapshot(`
      {
        "choices": [
          {
            "hint": "other changes that don't modify src or test files",
            "indent": " ",
            "message": "🤖 chore:",
            "name": "chore",
            "title": "🤖 chore:",
            "value": "chore",
          },
          {
            "hint": "changes to ci configuration files and scripts",
            "indent": " ",
            "message": "👷 ci:",
            "name": "ci",
            "title": "👷 ci:",
            "value": "ci",
          },
          {
            "hint": "add or update documentation",
            "indent": " ",
            "message": "📝 docs:",
            "name": "docs",
            "title": "📝 docs:",
            "value": "docs",
          },
          {
            "hint": "a new feature",
            "indent": " ",
            "message": "✨ feat:",
            "name": "feat",
            "title": "✨ feat:",
            "value": "feat",
          },
          {
            "hint": "fix a bug",
            "indent": " ",
            "message": "🐛 fix:",
            "name": "fix",
            "title": "🐛 fix:",
            "value": "fix",
          },
          {
            "hint": "improve performance",
            "indent": " ",
            "message": "⚡️ perf:",
            "name": "perf",
            "title": "⚡️ perf:",
            "value": "perf",
          },
          {
            "hint": "refactor code",
            "indent": " ",
            "message": "🔄 refactor:",
            "name": "refactor",
            "title": "🔄 refactor:",
            "value": "refactor",
          },
          {
            "hint": "deploy stuff",
            "indent": " ",
            "message": "🚀 release:",
            "name": "release",
            "title": "🚀 release:",
            "value": "release",
          },
          {
            "hint": "revert changes",
            "indent": " ",
            "message": "⏪ revert:",
            "name": "revert",
            "title": "⏪ revert:",
            "value": "revert",
          },
          {
            "hint": "improve structure / format of the code",
            "indent": " ",
            "message": "🎨 style:",
            "name": "style",
            "title": "🎨 style:",
            "value": "style",
          },
          {
            "hint": "add or update tests",
            "indent": " ",
            "message": "✅ test:",
            "name": "test",
            "title": "✅ test:",
            "value": "test",
          },
        ],
        "hint": "...type or use arrow keys",
        "limit": 10,
        "message": "Choose the type",
        "name": "type",
        "suggest": [Function],
        "type": "autocomplete",
      }
    `);
  });

  it("should suggest needle in the haystack", () => {
    const { suggest } = setupType();

    const needle = suggest("actor");

    expect(needle).toStrictEqual([
      {
        hint: "refactor code",
        indent: " ",
        message: "🔄 refactor:",
        name: "refactor",
        title: "🔄 refactor:",
        value: "refactor",
      },
    ]);
  });
});
