import { lang } from "./lang";

describe("lang", () => {
  it("should create lang", () => {
    expect(lang).toMatchInlineSnapshot(`
      {
        "description": "interactive conventional commits cli",
        "examples": "
        $ gitzy
        $ gitzy -p -a
        $ gitzy -m "add cool new feature" -t feat -s amazing
        $ gitzy -lD --no-emoji
        ",
        "flags": {
          "body": "set body inline",
          "breaking": "mark as breaking; add message for "footer"/"both" formats, or the flag for "!" format",
          "commitlint": "leverage local commitlint config",
          "dryRun": "show commit message without committing",
          "hook": "enable running inside a git hook (e.g. pre-commit)",
          "issues": "set issues inline",
          "noEmoji": "disable all emojis",
          "passthrough": "pass remaining arguments to git (e.g. after \`--\`)",
          "retry": "retry last commit and skip prompts",
          "scope": "set scope inline",
          "skip": "skip prompts",
          "subject": "set subject inline",
          "type": "set type inline",
        },
      }
    `);
  });
});
