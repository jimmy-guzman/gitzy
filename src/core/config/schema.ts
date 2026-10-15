import type { GenericSchema } from "valibot";
import {
  array,
  boolean,
  number,
  object,
  optional,
  parse,
  picklist,
  pipe,
  readonly,
  record,
  string,
  transform,
  union,
  unknown,
} from "valibot";

import { promptNames } from "./defaults";
import type { Config, ResolvedConfig } from "./types";

const typeEntrySchema = object({
  description: optional(string()),
  emoji: optional(string()),
  name: string(),
});

const scopeEntrySchema = object({
  description: optional(string()),
  name: string(),
});

const typeSchema = union([string(), typeEntrySchema]);
const scopeSchema = union([string(), scopeEntrySchema]);

export const ConfigSchema = object({
  body: optional(
    object({
      max: optional(number()),
      min: optional(number()),
    })
  ),
  branch: optional(
    object({
      checkout: optional(boolean()),
      max: optional(number()),
      pattern: optional(string()),
    })
  ),
  breaking: optional(
    object({
      format: optional(picklist(["!", "both", "footer"] as const)),
    })
  ),
  emoji: optional(
    object({
      breaking: optional(string()),
      enabled: optional(boolean()),
      issues: optional(string()),
    })
  ),
  header: optional(
    object({
      max: optional(number()),
      min: optional(number()),
    })
  ),
  issues: optional(
    object({
      hint: optional(string()),
      pattern: optional(picklist(["github", "jira"] as const)),
      prefix: optional(string()),
    })
  ),
  prompts: pipe(optional(array(string())), readonly()),
  scopes: pipe(optional(array(scopeSchema)), readonly()),
  types: pipe(optional(array(typeSchema)), readonly()),
});

/**
 * Every key of a config value, nested; leaves and non-objects are `null`, arrays are keyed by index.
 */
type KeyTree = null | { readonly [key: string]: KeyTree };

const keyTreeLeaf = pipe(
  unknown(),
  transform(() => null)
);

const keyTreeSchema = (depth: number): GenericSchema<unknown, KeyTree> =>
  depth === 0
    ? keyTreeLeaf
    : union([record(string(), keyTreeSchema(depth - 1)), keyTreeLeaf]);

/**
 * Reads a raw config's keys as deep as `ConfigSchema` goes (`types.0.emoji`), so self-referencing values can't recurse forever.
 */
export const KeyTreeSchema = keyTreeSchema(3);

const findUnknownKeys = (
  input: KeyTree,
  output: KeyTree,
  path: string
): string[] => {
  if (input === null || output === null) {
    return [];
  }

  return Object.entries(input).flatMap(([key, value]) => {
    const keyPath = path ? `${path}.${key}` : key;

    return Object.hasOwn(output, key)
      ? findUnknownKeys(value, output[key], keyPath)
      : [keyPath];
  });
};

/**
 * Finds config mistakes that load without error: keys the schema strips, unknown prompt names, negative lengths and minimums above their maximums.
 *
 * @param keys - Every key of the raw gitzy config, parsed with `KeyTreeSchema`
 * @param output - The gitzy config after parsing with `ConfigSchema`
 * @param config - The fully resolved config
 *
 * @returns One human-readable warning per problem
 */
export const validateConfig = (
  keys: KeyTree,
  output: Config,
  config: ResolvedConfig
) => {
  const lengths = {
    "body.max": config.body.max,
    "body.min": config.body.min,
    "branch.max": config.branch.max,
    "header.max": config.header.max,
    "header.min": config.header.min,
  };
  const ranges = [
    ["header", config.header],
    ["body", config.body],
  ] as const;

  return [
    ...findUnknownKeys(keys, parse(KeyTreeSchema, output), "").map(
      (path) => `Unknown config key "${path}"`
    ),
    ...config.prompts
      .filter((name) => !promptNames.includes(name))
      .map((name) => `Unknown prompt "${name}"`),
    ...Object.entries(lengths)
      .filter(([, value]) => value !== undefined && value < 0)
      .map(([path, value]) => `${path} must not be negative (got ${value})`),
    ...ranges
      .filter(([, { max, min }]) => max !== undefined && min > max)
      .map(
        ([section, { max, min }]) =>
          `${section}.min (${min}) is greater than ${section}.max (${max})`
      ),
  ];
};
