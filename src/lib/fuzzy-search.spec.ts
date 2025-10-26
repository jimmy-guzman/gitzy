import { fuzzySearch } from "@/lib/fuzzy-search";

describe("fuzzySearch", () => {
  it("should return the needle in the haystack", () => {
    const needle = fuzzySearch(
      [{ name: "joe" }, { name: "jane" }],
      ["name"],
      "ne",
    );

    expect(needle).toStrictEqual([{ name: "jane" }]);
  });

  it("should return the haystack when search term is empty", () => {
    const needle = fuzzySearch(
      [{ name: "joe" }, { name: "jane" }],
      ["name"],
      "",
    );

    expect(needle).toStrictEqual([{ name: "joe" }, { name: "jane" }]);
  });

  it("should sort by strict equality", () => {
    const needle = fuzzySearch(
      [{ name: "jimmy" }, { name: "jim" }],
      ["name"],
      "jim",
    );

    expect(needle).toStrictEqual([{ name: "jim" }, { name: "jimmy" }]);
  });

  it("should handle empty haystack", () => {
    const result = fuzzySearch([], ["name"], "test");

    expect(result).toStrictEqual([]);
  });

  it("should handle whitespace-only search term", () => {
    const haystack = [{ name: "joe" }, { name: "jane" }];

    expect(fuzzySearch(haystack, ["name"], "   ")).toStrictEqual(haystack);
  });

  it("should return empty array when no matches found", () => {
    const result = fuzzySearch(
      [{ name: "apple" }, { name: "banana" }],
      ["name"],
      "xyz123",
    );

    expect(result).toStrictEqual([]);
  });

  it("should search across multiple keys", () => {
    const haystack = [
      { email: "john@test.com", name: "john" },
      { email: "jane@example.com", name: "jane" },
      { email: "bob@test.com", name: "bob" },
    ];

    const result = fuzzySearch(haystack, ["name", "email"], "test");

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ email: "john@test.com", name: "john" });
    expect(result).toContainEqual({ email: "bob@test.com", name: "bob" });
  });

  it("should prioritize matches in first key over second key", () => {
    const haystack = [
      { email: "other@example.com", name: "test" },
      { email: "test@example.com", name: "other" },
    ];

    const result = fuzzySearch(haystack, ["name", "email"], "test");

    expect(result[0]).toStrictEqual({
      email: "other@example.com",
      name: "test",
    });
  });

  it("should handle case insensitive matching", () => {
    const result = fuzzySearch(
      [{ name: "John" }, { name: "jane" }],
      ["name"],
      "JOHN",
    );

    expect(result).toContainEqual({ name: "John" });
  });

  it("should handle mixed case in search term and data", () => {
    const result = fuzzySearch(
      [
        { name: "McDonald" },
        {
          // cspell:disable-next-line
          name: "mcdonalds",
        },
      ],
      ["name"],
      "mcd",
    );

    expect(result).toHaveLength(2);
  });

  it("should handle objects with additional properties", () => {
    const haystack = [
      { category: "fruit", id: 1, name: "apple", price: 1.99 },
      { category: "fruit", id: 2, name: "banana", price: 0.99 },
      { category: "vegetable", id: 3, name: "carrot", price: 0.79 },
    ];

    const result = fuzzySearch(haystack, ["name"], "app");

    expect(result).toStrictEqual([
      { category: "fruit", id: 1, name: "apple", price: 1.99 },
    ]);
  });

  it("should handle numeric values in search keys", () => {
    const haystack = [
      { code: 12_345, name: "item1" },
      { code: 67_890, name: "item2" },
      { code: 12_300, name: "item3" },
    ];

    const result = fuzzySearch(haystack, ["code"], "123");

    expect(result).toHaveLength(2);
  });

  it("should maintain consistent ordering for identical scores", () => {
    const haystack = [{ name: "test1" }, { name: "test2" }, { name: "test3" }];

    const result1 = fuzzySearch(haystack, ["name"], "test");
    const result2 = fuzzySearch(haystack, ["name"], "test");

    expect(result1).toStrictEqual(result2);
  });

  it("should handle large datasets efficiently", () => {
    const largeHaystack = Array.from({ length: 1000 }, (_, i) => {
      return {
        description: `description for item ${i}`,
        name: `item${i}`,
      };
    });

    const startTime = performance.now();
    const result = fuzzySearch(largeHaystack, ["name", "description"], "item5");
    const endTime = performance.now();

    expect(result.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(100);
  });

  it("should handle special characters", () => {
    const haystack = [
      { name: "café" },
      { name: "naïve" },
      {
        // cspell:disable-next-line
        name: "résumé",
      },
    ];

    const result = fuzzySearch(haystack, ["name"], "cafe");

    expect(result).toContainEqual({ name: "café" });
  });

  it("should handle symbols and punctuation", () => {
    const haystack = [
      { name: "user@example.com" },
      { name: "test-user" },
      { name: "user_name" },
    ];

    const result = fuzzySearch(haystack, ["name"], "user");

    expect(result).toHaveLength(3);
  });

  it("should respect fuzzy matching threshold", () => {
    const result = fuzzySearch(
      [{ name: "completely different" }],
      ["name"],
      "xyz",
    );

    expect(result).toStrictEqual([]);
  });

  it("should find close matches within threshold", () => {
    const result = fuzzySearch(
      [{ name: "javascript" }, { name: "typescript" }],
      ["name"],
      // cspell:disable-next-line
      "javscript",
    );

    expect(result).toContainEqual({ name: "javascript" });
  });

  it("should return references to original objects, not copies", () => {
    const originalObject = { id: 1, name: "test" };
    const haystack = [originalObject];

    const result = fuzzySearch(haystack, ["name"], "test");

    expect(result[0]).toBe(originalObject);
  });

  it("should not mutate the original haystack", () => {
    const originalHaystack = [{ name: "apple" }, { name: "banana" }];
    const haystackCopy = [...originalHaystack];

    fuzzySearch(originalHaystack, ["name"], "app");

    expect(originalHaystack).toStrictEqual(haystackCopy);
  });

  it("should only match meaningful subsequences, not weak character overlaps", () => {
    const haystack = [
      { value: "refactor" },
      { value: "ci" },
      { value: "docs" },
      { value: "chore" },
      { value: "actor" },
    ];

    const result = fuzzySearch(haystack, ["value"], "actor");

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ value: "actor" });
    expect(result).toContainEqual({ value: "refactor" });

    expect(result[0]).toStrictEqual({ value: "actor" });
    expect(result[1]).toStrictEqual({ value: "refactor" });
  });

  it("should handle null or undefined values in search keys", () => {
    const haystack = [
      { email: null as unknown as string, name: "john" },
      { email: "test@example.com", name: null as unknown as string },
      { email: "jane@example.com", name: "jane" },
    ];

    const result = fuzzySearch(haystack, ["name", "email"], "john");

    expect(result).toContainEqual({ email: null, name: "john" });
  });

  it("should handle undefined values gracefully", () => {
    const haystack = [
      { email: undefined as unknown as string, name: "test" },
      { email: "email@test.com", name: "other" },
    ];

    const result = fuzzySearch(haystack, ["name", "email"], "test");

    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle non-string searchable values", () => {
    const haystack = [
      { id: 123, name: "item1" },
      { id: 456, name: "item2" },
      { id: null as unknown as string, name: "item3" },
    ];

    const result = fuzzySearch(haystack, ["id", "name"], "123");

    expect(result).toContainEqual({ id: 123, name: "item1" });
  });

  it("should handle search with only special characters", () => {
    const haystack = [
      { name: "test@example.com" },
      { name: "user#123" },
      { name: "item-1" },
    ];

    const result = fuzzySearch(haystack, ["name"], "@#$");

    // Should either return empty or handle gracefully
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle very long search terms", () => {
    const haystack = [{ name: "short" }, { name: "medium length text" }];

    const result = fuzzySearch(
      haystack,
      ["name"],
      "this is a very long search term that exceeds reasonable length",
    );

    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle edge case where search returns partial results", () => {
    const haystack = [{ name: "test" }];

    // Test with search terms that might cause uFuzzy to return unexpected results
    const result = fuzzySearch(haystack, ["name"], "zzz");

    expect(result).toStrictEqual([]);
  });

  it("should handle edge case where search term is '*'", () => {
    const haystack = [{ name: "*" }];

    const result = fuzzySearch(haystack, ["name"], "*");

    expect(result).toStrictEqual([{ name: "*" }]);
  });
});
