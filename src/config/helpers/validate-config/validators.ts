import type { UnknownObject } from "../../../interfaces";

import { defaultConfig } from "../../../defaults";
import { validIssuesPrefixes } from "./constants";

type Validator<T = unknown> = (value: T) => boolean;

export const hasProperty = (object: UnknownObject, key: string) => {
  return Object.prototype.hasOwnProperty.call(object, key);
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object";
};

export const isArrayOfStrings = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(isString);
};

export const isValidDetails: Validator = (value) => {
  return (
    isObject(value) &&
    Object.values(value as UnknownObject).every((object) => {
      const detail = object as UnknownObject;

      return (
        isObject(detail) &&
        hasProperty(detail, "description") &&
        hasProperty(detail, "emoji") &&
        Object.values(detail).every(isString)
      );
    })
  );
};

export const isValidIssues: Validator = (value) => {
  return isString(value) && validIssuesPrefixes.includes(value);
};

export const hasAdditionalProperties = (object: UnknownObject) => {
  const allowedKeys = Object.keys(defaultConfig);

  return Object.keys(object).some((key) => {
    return !allowedKeys.includes(key);
  });
};
