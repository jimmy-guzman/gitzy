export const cleanObject = (
  object: Record<string, unknown>
): Record<string, unknown> => {
  return Object.entries(object).reduce<Record<string, unknown>>(
    (currentObject, [key, value]) => {
      const isEmpty = value === null || value === undefined

      return isEmpty
        ? currentObject
        : ((currentObject[key] = value), currentObject)
    },
    {}
  )
}
