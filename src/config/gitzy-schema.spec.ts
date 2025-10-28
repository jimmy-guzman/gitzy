import * as v from "valibot";

import { defaultConfig } from "@/defaults/config";

import { ConfigSchema } from "./gitzy-schema";
import { lang } from "./lang";

describe("configSchema", () => {
  it("should return error if breakingChangeEmoji is invalid", () => {
    const result = v.safeParse(ConfigSchema, { breakingChangeEmoji: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.breakingChangeEmoji,
    );
  });

  it("should return error if closedIssueEmoji is invalid", () => {
    const result = v.safeParse(ConfigSchema, { closedIssueEmoji: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.closedIssueEmoji,
    );
  });

  it("should return error if details is invalid", () => {
    const result = v.safeParse(ConfigSchema, { details: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should return error if disableEmoji is invalid", () => {
    const result = v.safeParse(ConfigSchema, { disableEmoji: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.disableEmoji);
  });

  it("should return error if headerMaxLength is invalid", () => {
    const result = v.safeParse(ConfigSchema, { headerMaxLength: "banana" });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.headerMaxLength,
    );
  });

  it("should return error if headerMinLength is invalid", () => {
    const result = v.safeParse(ConfigSchema, { headerMinLength: "banana" });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.headerMinLength,
    );
  });

  it("should return error if issuesHint is invalid", () => {
    const result = v.safeParse(ConfigSchema, { issuesHint: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.issuesHint);
  });

  it("should return error if issuesPrefix is invalid", () => {
    const result = v.safeParse(ConfigSchema, { issuesPrefix: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should return error if questions is invalid", () => {
    const result = v.safeParse(ConfigSchema, { questions: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.questions);
  });

  it("should return error if scopes is invalid", () => {
    const result = v.safeParse(ConfigSchema, { scopes: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.scopes);
  });

  it("should return error if types is invalid", () => {
    const result = v.safeParse(ConfigSchema, { types: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(lang.types);
  });

  it("should return error if useCommitlintConfig is invalid", () => {
    const result = v.safeParse(ConfigSchema, { useCommitlintConfig: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBe(
      lang.useCommitlintConfig,
    );
  });

  it("should return error if breakingChangeFormat is invalid", () => {
    const result = v.safeParse(ConfigSchema, { breakingChangeFormat: 1 });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should return error if breakingChangeFormat is invalid string", () => {
    const result = v.safeParse(ConfigSchema, {
      breakingChangeFormat: "invalid",
    });

    expect(result.success).toBe(false);
    expect(result.success || result.issues[0].message).toBeDefined();
  });

  it("should accept valid partial config", () => {
    const result = v.safeParse(ConfigSchema, { disableEmoji: true });

    expect(result.success).toBe(true);
  });

  it("should accept empty config with defaults", () => {
    const result = v.safeParse(ConfigSchema, {});

    expect(result.success).toBe(true);
  });

  it("should reject unknown properties", () => {
    const result = v.safeParse(ConfigSchema, { unknownProp: "value" });

    expect(result.success).toBe(false);
  });

  it("should have defaultConfig conforming to configSchema", () => {
    expect(() => {
      return v.parse(ConfigSchema, defaultConfig);
    }).not.toThrow();
  });
});
