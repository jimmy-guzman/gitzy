import { schema } from "./schema";

describe("scheme", () => {
  it(`should return message if breakingChangeEmoji is invalid`, () => {
    expect(schema.breakingChangeEmoji(1)).toBe(
      "breakingChangeEmoji must be a string",
    );
  });

  it(`should return message if closedIssueEmoji is invalid`, () => {
    expect(schema.closedIssueEmoji(1)).toBe(
      "closedIssueEmoji must be a string",
    );
  });

  it(`should return message if details is invalid`, () => {
    expect(schema.details(1)).toBe(
      'details must look like "{ description: "A new feature", emoji: "✨" }"',
    );
  });

  it(`should return message if disableEmoji is invalid`, () => {
    expect(schema.disableEmoji(1)).toBe("disableEmoji must be a boolean");
  });

  it(`should return message if headerMaxLength is invalid`, () => {
    expect(schema.headerMaxLength("banana")).toBe(
      "headerMaxLength must be a number",
    );
  });

  it(`should return message if headerMinLength is invalid`, () => {
    expect(schema.headerMinLength("banana")).toBe(
      "headerMinLength must be a number",
    );
  });

  it(`should return message if issuesHint is invalid`, () => {
    expect(schema.issuesHint(1)).toBe("issuesHint must be a string");
  });

  it(`should return message if issuesPrefix is invalid`, () => {
    expect(schema.issuesPrefix(1)).toBe(
      "issuesPrefix must be one of close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved",
    );
  });

  it(`should return message if questions is invalid`, () => {
    expect(schema.questions(1)).toBe("questions must be an array of strings");
  });

  it(`should return message if scopes is invalid`, () => {
    expect(schema.scopes(1)).toBe("scopes must be an array of strings");
  });

  it(`should return message if types is invalid`, () => {
    expect(schema.types(1)).toBe("types must be an array of strings");
  });

  it(`should return message if useCommitlintConfig is invalid`, () => {
    expect(schema.useCommitlintConfig(1)).toBe(
      "useCommitlintConfig must be a boolean",
    );
  });
});
