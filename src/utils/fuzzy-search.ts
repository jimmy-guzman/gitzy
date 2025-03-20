import Fuse from "fuse.js";

type Boundary = Record<string, number | string>;

export const fuzzySearch = <T extends Boundary>(
  haystack: T[],
  keys: Extract<keyof T, string>[],
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
