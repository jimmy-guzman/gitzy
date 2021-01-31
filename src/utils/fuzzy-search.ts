/**
 * escapes `\ ^ $ * + ? . ( ) | { } [ ]`
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const fuzzyMatch = <T>(str: T, query: string): boolean => {
  const pattern = query
    .split('')
    .map(escapeRegExp)
    .reduce((a, b) => `${a}[^${b}]*${escapeRegExp(b)}`)

  return new RegExp(pattern).test((str as unknown) as string)
}

/**
 * regex based fuzzy search
 * @param a haystack
 * @param q query
 * @param k key
 * @example fuzzySearch([{name: 'joe'},{name: 'jane'}], 'ne', 'name') // {name: 'jane'}
 */
export const fuzzySearch = <T>(a: T[], q: string, k: keyof T): Promise<T[]> => {
  return Promise.resolve(q ? a.filter((v) => fuzzyMatch(v[k], q)) : a)
}
