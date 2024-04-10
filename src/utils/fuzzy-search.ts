type Boundary = Record<string, number | string>;

/**
 * escapes `\ ^ $ * + ? . ( ) | { } [ ]`
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Creates regex to use to fuzzy match
 * @param needle
 * @returns regex
 */
const fuzzyRegex = (needle: string): RegExp => {
  const pattern = needle
    .split("")
    .map(escapeRegExp)
    .reduce((acc, curr) => {
      return `${acc}[^${curr}]*${escapeRegExp(curr)}`;
    });

  return new RegExp(pattern);
};

const fuzzyMatch = <T extends Boundary>(
  value: T[keyof T],
  needle: string,
): boolean => {
  return fuzzyRegex(needle).test(String(value));
};

const filterByFuzzySearch = <T extends Boundary>(
  haystack: T[],
  needle: string,
  key: keyof T,
): T[] => {
  return haystack
    .filter((hay) => {
      return fuzzyMatch(hay[key], needle);
    })
    .sort((hay) => {
      return hay[key] === needle ? -1 : 1;
    });
};

/**
 * Filters an array of objects by applying a fuzzy search on an object's value by the given key
 * @param haystack haystack
 * @param needle needle
 * @param key key
 * @example
 * fuzzySearch([{name: 'joe'},{name: 'jane'}], 'ne', 'name') // {name: 'jane'}
 */
export const fuzzySearch = <T extends Boundary>(
  haystack: T[],
  needle: string,
  key: keyof T,
): Promise<T[]> => {
  return Promise.resolve(
    needle ? filterByFuzzySearch(haystack, needle, key) : haystack,
  );
};
