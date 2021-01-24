import { defaultConfig } from '../../../defaults'
import { UnknownObject } from '../../../interfaces'
import { validIssuesPrefixes } from './constants'

type Validator<T = unknown> = (value: T) => boolean

export const hasProperty = (o: UnknownObject, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(o, key)
}

export const isString: Validator = value => typeof value === 'string'

export const isBoolean: Validator = value => typeof value === 'boolean'

export const isNumber: Validator = value => typeof value === 'number'

export const isObject: Validator = value => typeof value === 'object'

export const isArrayOfStrings: Validator = v => {
  return Array.isArray(v) && v.every(isString)
}

export const isValidDetails: Validator = value => {
  return (
    isObject(value) &&
    Object.values(value as UnknownObject).every(object => {
      const detail = object as UnknownObject

      return (
        isObject(detail) &&
        hasProperty(detail, 'description') &&
        hasProperty(detail, 'emoji') &&
        Object.values(detail).every(isString)
      )
    })
  )
}

export const isValidIssues: Validator = value => {
  return (
    isString(value) &&
    (validIssuesPrefixes as string[]).includes(value as string)
  )
}

export const hasAdditionalProperties = (object: UnknownObject): boolean => {
  const allowedKeys = Object.keys(defaultConfig)

  return Object.keys(object).some(key => !allowedKeys.includes(key))
}
