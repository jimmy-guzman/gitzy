import { defaultResolvedConfig } from "@/core/config/defaults";

import { issues } from "./issues";

describe("issues", () => {
  it("should create issues prompt", () => {
    const issuesPrompt = issues({
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

    expect(issuesPrompt).toMatchInlineSnapshot(`
      {
        "hint": "#123, #456, resolves #789, org/repo#100",
        "message": "Add issues this commit closes
        closes:",
        "name": "issues",
        "type": "text",
      }
    `);
  });
});
