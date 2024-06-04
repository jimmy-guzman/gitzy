import { fuzzySearch } from "./fuzzy-search";

describe("fuzzy-search", () => {
  it("should return the needle in the haystack", () => {
    const needle = fuzzySearch(
      [{ name: "joe" }, { name: "jane" }],
      ["name"],
      "ne",
    );

    expect(needle).toStrictEqual([{ name: "jane" }]);
  });
  it("should return the haystack", () => {
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
  it("should leave fuzzy matches intact if none are strict equal", () => {
    const needle = fuzzySearch(
      [{ name: "jimmy" }, { name: "jim" }],
      ["name"],
      "j",
    );

    expect(needle).toStrictEqual([{ name: "jimmy" }, { name: "jim" }]);
  });
});
