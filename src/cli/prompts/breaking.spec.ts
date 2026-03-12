import { defaultResolvedConfig } from "@/core/config/defaults";

import { breaking } from "./breaking";

describe("breaking", () => {
  it("should create text breaking prompt", () => {
    const breakingPrompt = breaking({
      answers: {
        body: "",
        breaking: "",
        issues: [],
        scope: "",
        subject: "",
        type: "",
      },
      config: defaultResolvedConfig,
      flags: {},
    });

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
    const breakingPrompt = breaking({
      answers: {
        body: "",
        breaking: "",
        issues: [],
        scope: "",
        subject: "",
        type: "",
      },
      config: {
        ...defaultResolvedConfig,
        breaking: { format: "!" },
      },
      flags: {},
    });

    expect(breakingPrompt).toMatchInlineSnapshot(`
      {
        "message": "Is this a breaking change?",
        "name": "breaking",
        "type": "confirm",
      }
    `);
  });
});
