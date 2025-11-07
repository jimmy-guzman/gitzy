import uFuzzy from "@leeoniya/ufuzzy";

const uf = new uFuzzy({
  intraDel: 1,
  intraIns: 1,
  intraMode: 1,
  intraSub: 1,
  intraTrn: 1,
});

type Boundary = Record<string, number | string>;

/**
 * Performs fuzzy search on an array of objects
 *
 * @param items - Array of objects to search through
 *
 * @param keys - Object keys to search in
 *
 * @param needle - Search query string
 *
 * @returns Array of matching objects, sorted by relevance score
 */
export const fuzzySearch = <T extends Boundary>(
  items: T[],
  keys: Extract<keyof T, string>[],
  needle: string,
) => {
  if (needle.trim() === "") {
    return items;
  }

  const haystack = items.map((item) => keys.map((key) => item[key]).join("|"));

  const normalizedNeedle = uFuzzy.latinize(needle);
  const normalizedHaystack = uFuzzy.latinize(haystack);

  const [indexes, info, order] = uf.search(
    normalizedHaystack,
    normalizedNeedle,
  );

  if (!indexes || !info || indexes.length === 0) {
    return haystack.flatMap((item, idx) => {
      return item.toLowerCase().includes(needle.toLowerCase())
        ? [items[idx]]
        : [];
    });
  }

  const result = order.map((orderIdx) => items[indexes[orderIdx]]);

  return result;
};
