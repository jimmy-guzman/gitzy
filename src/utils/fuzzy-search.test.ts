import { fuzzySearch } from "./fuzzy-search";

describe("fuzzy-search", () => {
  it("should return the needle in the haystack", async () => {
    const needle = await fuzzySearch(
      [{ name: "joe" }, { name: "jane" }],
      "ne",
      "name",
    );

    expect(needle).toStrictEqual([{ name: "jane" }]);
  });
  it("should return the haystack", async () => {
    const needle = await fuzzySearch(
      [{ name: "joe" }, { name: "jane" }],
      "",
      "name",
    );

    expect(needle).toStrictEqual([{ name: "joe" }, { name: "jane" }]);
  });
  it("should sort by strict equality", async () => {
    const needle = await fuzzySearch(
      [{ name: "jimmy" }, { name: "jim" }],
      "jim",
      "name",
    );

    expect(needle).toStrictEqual([{ name: "jim" }, { name: "jimmy" }]);
  });
  it("should leave fuzzy matches intact if none are strict equal", async () => {
    const needle = await fuzzySearch(
      [{ name: "jimmy" }, { name: "jim" }],
      "j",
      "name",
    );

    expect(needle).toStrictEqual([{ name: "jimmy" }, { name: "jim" }]);
  });
});
