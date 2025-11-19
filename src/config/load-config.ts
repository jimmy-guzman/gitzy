import type { Loader } from "lilconfig";
import type { BaseIssue, BaseSchema, InferOutput } from "valibot";

import { lilconfig } from "lilconfig";
import { safeParse, summarize } from "valibot";

import { loadTs } from "./load-ts";

const loadYaml: Loader = async (_filepath, content) => {
  const yaml = await import("yaml");

  // yaml.parse returns `any`, so keep it as `unknown` at the boundary.
  return yaml.parse(content) as unknown;
};

const configExts = [".js", ".cjs", ".mjs", ".ts", ".mts"] as const;

export const getSearchPlaces = (configName: string) => {
  const rcExts = ["", ".json", ".yaml", ".yml", ...configExts];

  const base = [
    ...rcExts.map((ext) => `.${configName}rc${ext}`),
    ...configExts.map((ext) => `${configName}.config${ext}`),
  ];

  return ["package.json", ...base, ...base.map((path) => `.config/${path}`)];
};

const isConfigFactory = (value: unknown): value is () => Promise<unknown> => {
  return typeof value === "function";
};

export const loadConfig = async <
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  configName: string,
  schema: TSchema,
): Promise<InferOutput<TSchema> | null> => {
  const explorer = lilconfig(configName, {
    loaders: {
      ".mts": loadTs,
      ".ts": loadTs,
      ".yaml": loadYaml,
      ".yml": loadYaml,
      "noExt": loadYaml,
    },
    searchPlaces: getSearchPlaces(configName),
  });

  const result = await explorer.search(process.cwd());

  if (!result?.config) return null;

  const maybeConfig = result.config as unknown;

  const rawConfig = isConfigFactory(maybeConfig)
    ? await maybeConfig()
    : maybeConfig;

  const parsed = safeParse(schema, rawConfig);

  if (!parsed.success) {
    throw new TypeError(summarize(parsed.issues));
  }

  return parsed.output;
};
