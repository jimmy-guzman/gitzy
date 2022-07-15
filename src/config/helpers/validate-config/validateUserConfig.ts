import type { UnknownObject } from '../../../interfaces'

import { schema } from './schema'
import { hasAdditionalProperties, isObject, isString } from './validators'

export const validateConfig = (userConfig: unknown): boolean | string => {
  if (!isObject(userConfig)) {
    return 'invalid configuration'
  }
  if (userConfig && hasAdditionalProperties(userConfig as UnknownObject)) {
    return 'unknown or additional properties detected'
  }
  return Object.entries(userConfig as UnknownObject).map(([key, value]) => {
    return schema[key](value)
  })[0]
}

export const validateUserConfig = async (
  userConfig: unknown
): Promise<boolean | string> => {
  const validation = await Promise.resolve(validateConfig(userConfig))

  if (isString(validation)) {
    throw new Error(validation as string)
  }

  return validation
}
