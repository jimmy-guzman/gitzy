import type { IssuesPrefixes } from "../../../interfaces";

import { defaultConfig } from "../../../defaults";
import { validIssuesPrefixes } from "./constants";

export const hasProperty = <K extends string>(
  object: Record<string, unknown>,
  key: K,
): object is Record<K, unknown> => {
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

export const isValidDetails = (
  value: unknown,
): value is Record<string, { description: string; emoji: string }> => {
  return (
    isObject(value) &&
    Object.values(value).every((object) => {
      const detail = object;

      return (
        isObject(detail) &&
        hasProperty(detail, "description") &&
        hasProperty(detail, "emoji") &&
        Object.values(detail).every(isString)
      );
    })
  );
};

export const isValidIssues = (value: unknown): value is IssuesPrefixes => {
  return isString(value) && validIssuesPrefixes.includes(value);
};

export const hasAdditionalProperties = (object: Record<string, unknown>) => {
  const allowedKeys = Object.keys(defaultConfig);

  return Object.keys(object).some((key) => {
    return !allowedKeys.includes(key);
  });
};
