export const shouldCheckIfStaged = (array: string[] = []): boolean => {
  return !['--add', '-a', '--amend'].some(flag => array.includes(flag))
}
