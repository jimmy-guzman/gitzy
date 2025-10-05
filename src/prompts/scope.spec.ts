import type { CreatedPromptOptions } from "../interfaces";

import { defaultConfig } from "../defaults";
import { scope } from "./scope";

const setupScope = (config = {}) => {
  return scope({
    config: { ...defaultConfig, ...config },
  } as CreatedPromptOptions);
};

describe("scope", () => {
  it("should return null if no scope", () => {
    expect(setupScope()).toBeNull();
  });

  it("should suggest needle in the haystack", () => {
    const scope = setupScope({ scopes: ["build"] });

    const needle = scope?.suggest("ui");

    expect(needle).toStrictEqual([
      { indent: " ", title: "build", value: "build" },
    ]);
  });

  it("should return scope prompt if there is a scope", () => {
    expect(setupScope({ scopes: ["build"] })).toMatchInlineSnapshot(`
      {
        "choices": [
          {
            "indent": " ",
            "title": "build",
            "value": "build",
          },
        ],
        "hint": "...type or use arrow keys",
        "limit": 10,
        "message": "Choose the scope",
        "name": "scope",
        "suggest": [Function],
        "type": "autocomplete",
      }
    `);
  });
});
