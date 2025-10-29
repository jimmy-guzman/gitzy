import type { EnquirerChoice } from "@/interfaces";

import { defaultConfig } from "@/defaults/config";

import { choice, type } from "./type";

const setupType = (config = {}) => {
  return type({
    config: { ...defaultConfig, ...config },
  });
};
const setupChoice = (
  config = {},
  flags = {},
  currentType = "feat",
): EnquirerChoice => {
  return choice({ ...defaultConfig, ...config }, currentType, {
    emoji: true,
    ...flags,
  });
};

describe("choice", () => {
  it("should create a default choice", () => {
    expect(setupChoice()).toStrictEqual({
      hint: "a new feature",
      indent: " ",
      title: "✨ feat:",
      value: "feat",
    });
  });

  it("should not have an emoji when disableEmoji", () => {
    const { title } = setupChoice({ disableEmoji: true });

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
});

describe("type", () => {
  it("should return scope prompt if there is a scope", () => {
    expect(setupType({ scopes: ["build"] })).toMatchInlineSnapshot(`
      {
        "choices": [
          {
            "hint": "other changes that don't modify src or test files",
            "indent": " ",
            "title": "chore:",
            "value": "chore",
          },
          {
            "hint": "add or update documentation",
            "indent": " ",
            "title": "docs:",
            "value": "docs",
          },
          {
            "hint": "a new feature",
            "indent": " ",
            "title": "feat:",
            "value": "feat",
          },
          {
            "hint": "fix a bug",
            "indent": " ",
            "title": "fix:",
            "value": "fix",
          },
          {
            "hint": "refactor code",
            "indent": " ",
            "title": "refactor:",
            "value": "refactor",
          },
          {
            "hint": "add or update tests",
            "indent": " ",
            "title": "test:",
            "value": "test",
          },
          {
            "hint": "improve structure / format of the code",
            "indent": " ",
            "title": "style:",
            "value": "style",
          },
          {
            "hint": "changes to ci configuration files and scripts",
            "indent": " ",
            "title": "ci:",
            "value": "ci",
          },
          {
            "hint": "improve performance",
            "indent": " ",
            "title": "perf:",
            "value": "perf",
          },
          {
            "hint": "revert changes",
            "indent": " ",
            "title": "revert:",
            "value": "revert",
          },
          {
            "hint": "deploy stuff",
            "indent": " ",
            "title": "release:",
            "value": "release",
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
        title: "refactor:",
        value: "refactor",
      },
    ]);
  });
});
