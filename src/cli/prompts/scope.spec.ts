import { defaultResolvedConfig } from "@/core/config/defaults";
import { defaultMessageParts } from "@/core/conventional/types";

import { scope } from "./scope";

const setupScope = (configOverrides = {}) => {
  return scope({
    answers: defaultMessageParts,
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

describe("scope", () => {
  it("should return null if no scope", () => {
    expect(setupScope()).toBeNull();
  });

  it("should suggest needle in the haystack", () => {
    const scopePrompt = setupScope({
      scopes: [{ name: "build" }],
    });

    const needle = scopePrompt?.suggest("ui");

    expect(needle).toStrictEqual([
      {
        hint: "",
        indent: " ",
        message: "build",
        name: "build",
        title: "build",
        value: "build",
      },
    ]);
  });

  it("should return scope prompt if there is a scope", () => {
    expect(setupScope({ scopes: [{ name: "build" }] })).toMatchInlineSnapshot(`
      {
        "choices": [
          {
            "hint": "",
            "indent": " ",
            "message": "build",
            "name": "build",
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
