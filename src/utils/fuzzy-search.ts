import Fuse from "fuse.js";

type Boundary = Record<string, number | string>;

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
