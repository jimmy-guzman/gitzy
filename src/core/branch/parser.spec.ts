import { parseBranchName } from "./parser";

describe(parseBranchName, () => {
  it("should parse type and subject", () => {
    expect(parseBranchName("feat/add-dark-mode", [])).toStrictEqual({
      subject: "add-dark-mode",
      type: "feat",
    });
  });

  it("should parse a known scope", () => {
    expect(parseBranchName("feat/ui/add-dark-mode", ["ui"])).toStrictEqual({
      scope: "ui",
      subject: "add-dark-mode",
      type: "feat",
    });
  });

  it("should treat an unknown scope as part of the subject", () => {
    expect(parseBranchName("feat/ui/add-dark-mode", [])).toStrictEqual({
      subject: "ui-add-dark-mode",
      type: "feat",
    });
  });

  it("should extract a GitHub issue prefix", () => {
    expect(parseBranchName("fix/#42-crash-on-start", [])).toStrictEqual({
      issue: "#42",
      subject: "crash-on-start",
      type: "fix",
    });
  });

  it("should extract a Jira issue prefix after the scope", () => {
    expect(
      parseBranchName("feat/ui/PROJ-123-add-dark-mode", ["ui"])
    ).toStrictEqual({
      issue: "PROJ-123",
      scope: "ui",
      subject: "add-dark-mode",
      type: "feat",
    });
  });

  it("should handle an empty branch name", () => {
    expect(parseBranchName("", [])).toStrictEqual({ subject: "", type: "" });
  });
});
