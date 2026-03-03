import type { Loader } from "lilconfig";
import type { BaseIssue, BaseSchema } from "valibot";

import { lilconfig } from "lilconfig";
import { safeParse, summarize } from "valibot";

const loadYaml: Loader = async (_filepath, content) => {
  const yaml = await import("yaml");

  // yaml.parse returns `any`, so keep it as `unknown` at the boundary.
  return yaml.parse(content) as unknown;
};

const configExts = [".js", ".cjs", ".mjs"] as const;

const getSearchPlaces = (configName: string) => {
  const rcExts = ["", ".json", ".yaml", ".yml", ...configExts];

  const base = [
    ...rcExts.map((ext) => `.${configName}rc${ext}`),
    ...configExts.map((ext) => `${configName}.config${ext}`),
  ];

  return ["package.json", ...base, ...base.map((path) => `.config/${path}`)];
};

export const loadConfig = async <
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  configName: string,
  schema: TSchema,
) => {
  const explorer = lilconfig(configName, {
    loaders: {
      ".yaml": loadYaml,
      ".yml": loadYaml,
      "noExt": loadYaml,
    },
    searchPlaces: getSearchPlaces(configName),
  });

  const result = await explorer.search(process.cwd());

  if (!result?.config) return null;

  const parsed = safeParse(schema, result.config);

  if (!parsed.success) {
    throw new TypeError(summarize(parsed.issues));
  }

  return parsed.output;
};
