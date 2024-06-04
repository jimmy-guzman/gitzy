import Fuse from "fuse.js";

type Boundary = Record<string, number | string>;

/**
 * Filters an array of objects by applying a fuzzy search on an object's value by the given key
 * @param haystack haystack
 * @param needle needle
 * @param keys key
 * @example
    fuzzySearch(
      [{ name: "joe" }, { name: "jane" }],
      ["name"],
      "ne",
    ); // [{ name: "jane" }]
 */
export const fuzzySearch = <
  T extends Boundary,
  K extends Extract<keyof T, string>,
>(
  haystack: T[],
  keys: K[],
  needle: string,
) => {
  if (needle) {
    const fuse = new Fuse(haystack, { keys, threshold: 0.39 });

    return fuse.search(needle).map(({ item }) => {
      return item;
    });
  }

  return haystack;
};
