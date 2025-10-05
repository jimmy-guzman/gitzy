import { defaultConfig } from "../defaults";
import { issues } from "./issues";
import { issuesMessage } from "./lang";

describe("issues", () => {
  it("should create issues prompt", () => {
    const issuesPrompt = issues({
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

    expect(issuesPrompt).toStrictEqual({
      hint: "#123",
      message: issuesMessage(defaultConfig.issuesPrefix),
      name: "issues",
      type: "text",
    });
  });
});
