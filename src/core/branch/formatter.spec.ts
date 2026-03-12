import { defaultBranchConfig } from "@/core/config/defaults";

import { formatBranchName, slugify } from "./formatter";

describe("slugify", () => {
  it("should lowercase and replace spaces with separator", () => {
    expect(slugify("Add New Feature", "-")).toBe("add-new-feature");
  });

  it("should collapse consecutive separators", () => {
    expect(slugify("add  new   feature", "-")).toBe("add-new-feature");
  });

  it("should remove leading and trailing separators", () => {
    expect(slugify(" add new feature ", "-")).toBe("add-new-feature");
  });

  it("should handle special characters", () => {
    expect(slugify("add/new+feature!", "-")).toBe("add-new-feature");
  });

  it("should preserve dots", () => {
    expect(slugify("v1.2.3", "-")).toBe("v1.2.3");
  });

  it("should use custom separator", () => {
    expect(slugify("add new feature", "/")).toBe("add/new/feature");
  });
});

describe("formatBranchName", () => {
  it("should format full branch name with all parts", () => {
    const result = formatBranchName(
      {
        issue: "PROJ-123",
        scope: "cli",
        subject: "add new flag",
        type: "feat",
      },
      defaultBranchConfig,
    );

    expect(result).toMatchInlineSnapshot(`"feat/cli/PROJ-123-add/new/flag"`);
  });

  it("should omit scope segment when scope is absent", () => {
    const result = formatBranchName(
      { subject: "add new flag", type: "feat" },
      defaultBranchConfig,
    );

    expect(result).toMatchInlineSnapshot(`"feat/add/new/flag"`);
  });

  it("should omit issue segment when issue is absent", () => {
    const result = formatBranchName(
      { scope: "cli", subject: "add new flag", type: "feat" },
      defaultBranchConfig,
    );

    expect(result).toMatchInlineSnapshot(`"feat/cli/add/new/flag"`);
  });

  it("should omit both scope and issue when neither is present", () => {
    const result = formatBranchName(
      { subject: "fix crash", type: "fix" },
      defaultBranchConfig,
    );

    expect(result).toMatchInlineSnapshot(`"fix/fix/crash"`);
  });

  it("should truncate to config.max characters", () => {
    const result = formatBranchName(
      {
        subject:
          "this is a very very very very very very very very long subject",
        type: "feat",
      },
      { ...defaultBranchConfig, max: 20 },
    );

    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("should use custom separator", () => {
    const result = formatBranchName(
      { subject: "add new flag", type: "feat" },
      { ...defaultBranchConfig, pattern: "{type}-{subject}", separator: "-" },
    );

    expect(result).toMatchInlineSnapshot(`"feat-add-new-flag"`);
  });

  it("should use custom pattern", () => {
    const result = formatBranchName(
      { scope: "core", subject: "refactor module", type: "refactor" },
      { ...defaultBranchConfig, pattern: "{type}/{subject}", separator: "-" },
    );

    expect(result).toMatchInlineSnapshot(`"refactor/refactor-module"`);
  });

  it("should handle subject with special characters", () => {
    const result = formatBranchName(
      { subject: "fix: null pointer exception!", type: "fix" },
      { ...defaultBranchConfig, pattern: "{type}/{subject}", separator: "-" },
    );

    expect(result).toMatchInlineSnapshot(`"fix/fix-null-pointer-exception"`);
  });
});
