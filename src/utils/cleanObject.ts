import type { UnknownObject } from "../interfaces";

/**
 * Removes `null` or `undefined` values from object
 * @param object any object
 */
export const cleanObject = (object: UnknownObject): UnknownObject => {
  return Object.entries(object).reduce<UnknownObject>(
    (currentObject, [key, value]) => {
      const isEmpty = value === null || value === undefined;

      return isEmpty
        ? currentObject
        : ((currentObject[key] = value), currentObject);
    },
    {},
  );
};
