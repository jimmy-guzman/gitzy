const fuzzyMatch = <T>(str: T, query: string) => {
  const pattern = query.split('').reduce((a, b) => `${a}[^${b}]*${b}`)

  return new RegExp(pattern).test((str as unknown) as string)
}

export const fuzzySearch = <T>(
  array: T[],
  query: string,
  key: keyof T
): Promise<T[]> => {
  return Promise.resolve(
    query ? array.filter(v => fuzzyMatch(v[key], query)) : array
  )
}
