import type { Option } from "@clack/prompts";

import { createFuzzyFilter } from "@/cli/utils/fuzzy-search";

describe("createFuzzyFilter", () => {
  it("should return true for all options when search is empty", () => {
    const options: Option<string>[] = [
      { label: "joe", value: "joe" },
      { label: "jane", value: "jane" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("", options[0])).toBe(true);
    expect(filter("", options[1])).toBe(true);
  });

  it("should return true for all options when search is whitespace", () => {
    const options: Option<string>[] = [
      { label: "joe", value: "joe" },
      { label: "jane", value: "jane" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("   ", options[0])).toBe(true);
    expect(filter("   ", options[1])).toBe(true);
  });

  it("should filter by label match", () => {
    const options: Option<string>[] = [
      { label: "apple", value: "apple" },
      { label: "banana", value: "banana" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("app", options[0])).toBe(true);
    expect(filter("app", options[1])).toBe(false);
  });

  it("should filter by hint match", () => {
    const options: Option<string>[] = [
      { hint: "a new feature", label: "feat", value: "feat" },
      { hint: "fix a bug", label: "fix", value: "fix" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("feature", options[0])).toBe(true);
    expect(filter("feature", options[1])).toBe(false);
  });

  it("should handle fuzzy matching", () => {
    const options: Option<string>[] = [
      { hint: "refactor code", label: "refactor", value: "refactor" },
      { hint: "a new feature", label: "feat", value: "feat" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("actor", options[0])).toBe(true);
  });

  it("should fall back to case-insensitive substring match", () => {
    const options: Option<string>[] = [
      { label: "John", value: "john" },
      { label: "jane", value: "jane" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("JOHN", options[0])).toBe(true);
    expect(filter("JOHN", options[1])).toBe(false);
  });

  it("should return false for all options when no matches", () => {
    const options: Option<string>[] = [
      { label: "apple", value: "apple" },
      { label: "banana", value: "banana" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("xyz123", options[0])).toBe(false);
    expect(filter("xyz123", options[1])).toBe(false);
  });

  it("should cache results for the same needle", () => {
    const options: Option<string>[] = [
      { label: "apple", value: "apple" },
      { label: "banana", value: "banana" },
    ];
    const filter = createFuzzyFilter(options);

    const result1 = filter("app", options[0]);
    const result2 = filter("app", options[0]);

    expect(result1).toBe(result2);
  });

  it("should handle options without labels (uses value as string)", () => {
    const options: Option<string>[] = [{ value: "apple" }, { value: "banana" }];
    const filter = createFuzzyFilter(options);

    expect(filter("app", options[0])).toBe(true);
    expect(filter("app", options[1])).toBe(false);
  });

  it("should handle special characters in search", () => {
    const options: Option<string>[] = [
      { label: "café", value: "cafe" },
      { label: "naïve", value: "naive" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("cafe", options[0])).toBe(true);
  });

  it("should handle empty options array", () => {
    const options: Option<string>[] = [];
    const filter = createFuzzyFilter(options);

    expect(filter("test", { label: "test", value: "test" })).toBe(false);
  });

  it("should handle options with undefined hints", () => {
    const options: Option<string>[] = [
      { label: "feat", value: "feat" },
      { hint: "fix bugs", label: "fix", value: "fix" },
    ];
    const filter = createFuzzyFilter(options);

    expect(filter("bug", options[1])).toBe(true);
    expect(filter("bug", options[0])).toBe(false);
  });
});
