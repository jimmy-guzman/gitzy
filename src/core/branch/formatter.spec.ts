import { defaultBranchConfig } from "@/core/config/defaults";

import { formatBranchName, slugify } from "./formatter";

describe(slugify, () => {
  it("should lowercase and replace spaces with dashes", () => {
    expect(slugify("Add New Feature")).toBe("add-new-feature");
  });

  it("should collapse consecutive dashes", () => {
    expect(slugify("add  new   feature")).toBe("add-new-feature");
  });

  it("should remove leading and trailing dashes", () => {
    expect(slugify(" add new feature ")).toBe("add-new-feature");
  });

  it("should handle special characters", () => {
    expect(slugify("add/new+feature!")).toBe("add-new-feature");
  });

  it("should preserve dots", () => {
    expect(slugify("v1.2.3")).toBe("v1.2.3");
  });
});

describe(formatBranchName, () => {
  it("should format full branch name with all parts", () => {
    const result = formatBranchName(
      {
        issue: "PROJ-123",
        scope: "cli",
        subject: "add new flag",
        type: "feat",
      },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/cli/PROJ-123-add-new-flag"`);
  });

  it("should omit scope segment when scope is absent", () => {
    const result = formatBranchName(
      { subject: "add new flag", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/add-new-flag"`);
  });

  it("should omit issue segment when issue is absent", () => {
    const result = formatBranchName(
      { scope: "cli", subject: "add new flag", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/cli/add-new-flag"`);
  });

  it("should omit both scope and issue when neither is present", () => {
    const result = formatBranchName(
      { subject: "fix crash", type: "fix" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"fix/fix-crash"`);
  });

  it("should truncate to config.max characters", () => {
    const result = formatBranchName(
      {
        subject:
          "this is a very very very very very very very very long subject",
        type: "feat",
      },
      { ...defaultBranchConfig, max: 20 }
    );

    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("should use custom pattern", () => {
    const result = formatBranchName(
      { scope: "core", subject: "refactor module", type: "refactor" },
      { ...defaultBranchConfig, pattern: "{type}/{subject}" }
    );

    expect(result).toMatchInlineSnapshot(`"refactor/refactor-module"`);
  });

  it("should handle subject with special characters", () => {
    const result = formatBranchName(
      { subject: "fix: null pointer exception!", type: "fix" },
      { ...defaultBranchConfig, pattern: "{type}/{subject}" }
    );

    expect(result).toMatchInlineSnapshot(`"fix/fix-null-pointer-exception"`);
  });

  it("should replace whitespace in the issue with a dash", () => {
    const result = formatBranchName(
      { issue: "PROJ 12", subject: "x", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/PROJ-12-x"`);
  });

  it("should replace characters git rejects in the issue with a dash", () => {
    const result = formatBranchName(
      { issue: "A~B^C:D?E*F[G\\H..I@{J\tK\u0000L", subject: "x", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/A-B-C-D-E-F-G-H-I-J-K-L-x"`);
  });

  it("should not end with a dash after truncating", () => {
    const result = formatBranchName(
      { scope: "ui", subject: "a a a a a a a", type: "feat" },
      { ...defaultBranchConfig, max: 20 }
    );

    expect(result).toMatchInlineSnapshot(`"feat/ui/a-a-a-a-a-a"`);
  });

  it("should clean dots git rejects in any segment", () => {
    const result = formatBranchName(
      {
        issue: "a/.b",
        scope: "x.lock",
        subject: "v1..2 release",
        type: "feat",
      },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/x/a/b-v1.2-release"`);
  });

  it("should not start a segment with a dash left by a removed dot", () => {
    const result = formatBranchName(
      { issue: "a/._", subject: "x", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/a/x"`);
  });

  it("should drop a leading dot from the subject", () => {
    const result = formatBranchName(
      { subject: ".gitignore update", type: "chore" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"chore/gitignore-update"`);
  });

  it("should not end with .lock or a dot after truncating", () => {
    const result = formatBranchName(
      { subject: "x.lock.yz", type: "feat" },
      { ...defaultBranchConfig, max: 12 }
    );

    expect(result).toMatchInlineSnapshot(`"feat/x"`);
  });

  it("should strip Spanish accents", () => {
    const result = formatBranchName(
      { subject: "añadir modo oscuro", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/anadir-modo-oscuro"`);
  });

  it("should strip French accents", () => {
    const result = formatBranchName(
      { subject: "éléments à côté", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/elements-a-cote"`);
  });

  it("should strip German umlauts", () => {
    const result = formatBranchName(
      { subject: "Änderung für Käse", type: "feat" },
      defaultBranchConfig
    );

    expect(result).toMatchInlineSnapshot(`"feat/anderung-fur-kase"`);
  });
});
