import { defaultConfig } from "@/defaults/config";

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
      hint: "...supports multi line, press enter to go to next line",
      message: "Add a longer description\n",
      multiline: true,
      name: "body",
      result: expect.any(Function),
      type: "text",
    });
    expect(bodyPrompt.result(" whitespace ")).toBe("whitespace");
  });
});
