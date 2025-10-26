import { promptsLang } from "./lang";

describe("lang", () => {
  describe("promptsLang", () => {
    it("should create prompts lang", () => {
      expect(promptsLang).toMatchInlineSnapshot(`
        {
          "body": {
            "hint": "...supports multi line, press enter to go to next line",
            "message": "Add a longer description
        ",
          },
          "breaking": {
            "hint": "...skip when none",
            "message": "Add any breaking changes
          BREAKING CHANGE:",
          },
          "scope": {
            "hint": "...type or use arrow keys",
            "message": "Choose the scope",
          },
          "subject": {
            "message": "Add a short description",
          },
          "type": {
            "hint": "...type or use arrow keys",
            "message": "Choose the type",
          },
        }
      `);
    });
  });
});
