import type { UnknownObject } from "../../../interfaces";

import { schema } from "./schema";
import { hasAdditionalProperties, isObject, isString } from "./validators";

export const validateConfig = (userConfig: unknown) => {
  if (!isObject(userConfig)) {
    return "invalid configuration";
  }

  if (hasAdditionalProperties(userConfig as UnknownObject)) {
    return "unknown or additional properties detected";
  }

  return Object.entries(userConfig as UnknownObject).map(([key, value]) => {
    return schema[key](value);
  })[0];
};

export const validateUserConfig = async (userConfig: unknown) => {
  const validation = await Promise.resolve(validateConfig(userConfig));

  if (isString(validation)) {
    throw new Error(validation);
  }

  return validation;
};
