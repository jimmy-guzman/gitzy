import { defaultResolvedConfig } from "@/core/config/defaults";

import { body } from "./body";

describe("body", () => {
  it("should create body prompt", () => {
    const bodyPrompt = body({
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
