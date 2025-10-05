import { defaultConfig } from "../defaults";
import { breaking } from "./breaking";

describe("breaking", () => {
  it("should create body prompt", () => {
    const breakingPrompt = breaking({
      answers: {
        body: "",
        breaking: "",
        issues: "",
        scope: "",
        subject: "",
        type: "",
      },
      config: defaultConfig,
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
});
