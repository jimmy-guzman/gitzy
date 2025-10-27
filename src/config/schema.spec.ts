import * as v from "valibot";

import { lang } from "./lang";
import { configSchema } from "./schema";

describe("configSchema", () => {
  it("should return error if breakingChangeEmoji is invalid", () => {
    const result = v.safeParse(configSchema, { breakingChangeEmoji: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.breakingChangeEmoji,
    );
  });

  it("should return error if closedIssueEmoji is invalid", () => {
    const result = v.safeParse(configSchema, { closedIssueEmoji: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.closedIssueEmoji,
    );
  });

  it("should return error if details is invalid", () => {
    const result = v.safeParse(configSchema, { details: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should return error if disableEmoji is invalid", () => {
    const result = v.safeParse(configSchema, { disableEmoji: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.disableEmoji);
  });

  it("should return error if headerMaxLength is invalid", () => {
    const result = v.safeParse(configSchema, { headerMaxLength: "banana" });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.headerMaxLength,
    );
  });

  it("should return error if headerMinLength is invalid", () => {
    const result = v.safeParse(configSchema, { headerMinLength: "banana" });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.headerMinLength,
    );
  });

  it("should return error if issuesHint is invalid", () => {
    const result = v.safeParse(configSchema, { issuesHint: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.issuesHint);
  });

  it("should return error if issuesPrefix is invalid", () => {
    const result = v.safeParse(configSchema, { issuesPrefix: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should return error if questions is invalid", () => {
    const result = v.safeParse(configSchema, { questions: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.questions);
  });

  it("should return error if scopes is invalid", () => {
    const result = v.safeParse(configSchema, { scopes: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.scopes);
  });

  it("should return error if types is invalid", () => {
    const result = v.safeParse(configSchema, { types: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.types);
  });

  it("should return error if useCommitlintConfig is invalid", () => {
    const result = v.safeParse(configSchema, { useCommitlintConfig: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.useCommitlintConfig,
    );
  });

  it("should return error if breakingChangeFormat is invalid", () => {
    const result = v.safeParse(configSchema, { breakingChangeFormat: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should return error if breakingChangeFormat is invalid string", () => {
    const result = v.safeParse(configSchema, {
      breakingChangeFormat: "invalid",
    });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should accept valid partial config", () => {
    const result = v.safeParse(configSchema, { disableEmoji: true });

    expect(result.success).toBe(true);
  });

  it("should accept empty config with defaults", () => {
    const result = v.safeParse(configSchema, {});

    expect(result.success).toBe(true);
  });

  it("should reject unknown properties", () => {
    const result = v.safeParse(configSchema, { unknownProp: "value" });

    expect(result.success).toBe(false);
  });
});
