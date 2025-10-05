import { defaultConfig } from "../defaults";
import { body } from "./body";

describe("body", () => {
  it("should create body prompt", () => {
    const bodyPrompt = body({
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

    expect(bodyPrompt).toStrictEqual({
      format: expect.any(Function),
      hint: "...supports multi line, press enter to go to next line",
      message: "Add a longer description\n",
      multiline: true,
      name: "body",
      type: "text",
    });
    expect(bodyPrompt.format(" whitespace ")).toBe("whitespace");
  });
});
