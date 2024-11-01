import type {
  CreatedPromptOptions,
  EnquirerChoice,
  EnquirerPrompt,
} from "../interfaces";

import { defaultConfig } from "../defaults";
import { choice, type } from "./type";

const setupType = (config = {}): Required<EnquirerPrompt> => {
  return type({
    config: { ...defaultConfig, ...config },
  } as CreatedPromptOptions) as Required<EnquirerPrompt>;
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
  it('should add extra space for "refactor"', () => {
    const { title } = setupChoice({}, {}, "refactor");

    expect(title).toBe("♻️  refactor:");
  });
});

describe("type", () => {
  it("should return scope prompt if there is a scope", () => {
    expect(setupType({ scopes: ["build"] })).toMatchObject({
      hint: "[2m...type or use arrow keys[22m",
      message: "Choose the type",
      name: "type",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      suggest: expect.any(Function),
      type: "autocomplete",
    });
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
