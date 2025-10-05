import { lang } from "./lang";

describe("lang", () => {
  it("should create lang", () => {
    expect(lang).toMatchSnapshot();
  });

  it("should compose description", () => {
    expect(lang.description).toBe("interactive conventional commits cli");
  });

  it("should compose examples", () => {
    expect(lang.examples).toMatchInlineSnapshot(`
      "
        $ gitzy
        $ gitzy -p -a
        $ gitzy -m "added cool new feature" -t "feat" -s "amazing"
        $ gitzy -lD --no-emoji
        "
    `);
  });

  it("should compose flags.body", () => {
    expect(lang.flags.body).toBe(
      'skip "body" question and provide your own "body" message',
    );
  });

  it("should compose flags.breaking", () => {
    expect(lang.flags.breaking).toBe(
      'skip "breaking" question and provide your own "breaking" message',
    );
  });

  it("should compose flags.commitlint", () => {
    expect(lang.flags.commitlint).toBe("leverage commitlint's configuration");
  });

  it("should compose flags.dryRun", () => {
    expect(lang.flags.dryRun).toBe("displays git message but does not commit");
  });

  it("should compose flags.issues", () => {
    expect(lang.flags.issues).toBe(
      'skip "issues" question and provide your own "issues" message',
    );
  });

  it("should compose flags.noEmoji", () => {
    expect(lang.flags.noEmoji).toBe("disable all emojis");
  });

  it("should compose flags.passthrough", () => {
    expect(lang.flags.passthrough).toBe(
      'subsequent command line args passed through to "git"',
    );
  });

  it("should compose flags.retry", () => {
    expect(lang.flags.retry).toBe("retries previous commit, skips all prompts");
  });

  it("should compose flags.scope", () => {
    expect(lang.flags.scope).toBe(
      'skip "scope" question and provide your own "scope" message',
    );
  });

  it("should compose flags.skip", () => {
    expect(lang.flags.skip).toBe("skip questions");
  });

  it("should compose flags.subject", () => {
    expect(lang.flags.subject).toBe(
      'skip "subject" question and provide your own "subject" message',
    );
  });

  it("should compose flags.type", () => {
    expect(lang.flags.type).toBe(
      'skip "type" question and provide your own "type" message',
    );
  });
});
