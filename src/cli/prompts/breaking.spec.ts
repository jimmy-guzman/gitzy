import type { ResolvedConfig } from "@/core/config/types";

import { defaultResolvedConfig } from "@/core/config/defaults";

import { breaking } from "./breaking";

const setupBreaking = (configOverrides: Partial<ResolvedConfig> = {}) => {
  return breaking({
    answers: {
      body: "",
      breaking: "",
      issues: [],
      scope: "",
      subject: "",
      type: "",
    },
    config: { ...defaultResolvedConfig, ...configOverrides },
    flags: {},
  });
};

describe("breaking", () => {
  it("should create text breaking prompt", () => {
    const breakingPrompt = setupBreaking();

    expect(breakingPrompt).toMatchInlineSnapshot(`
      {
        "hint": "...skip when none",
        "message": "Add any breaking changes
        BREAKING CHANGE:",
        "name": "breaking",
        "type": "text",
      }
    `);
  });

  it("should create confirm breaking prompt", () => {
    const breakingPrompt = setupBreaking({ breaking: { format: "!" } });

    expect(breakingPrompt).toMatchInlineSnapshot(`
      {
        "message": "Is this a breaking change?",
        "name": "breaking",
        "type": "confirm",
      }
    `);
  });
});
