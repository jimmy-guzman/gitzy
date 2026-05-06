export const pluralize = (count: number, word: string) => {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
};
