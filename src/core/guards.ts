/**
 * Narrows a union to its string members.
 *
 * @param value - Value whose union may include strings
 *
 * @returns Whether the value is a string
 */
export const isString = <T>(value: T): value is Extract<T, string> =>
  typeof value === "string";
