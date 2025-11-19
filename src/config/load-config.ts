import type { Loader } from "lilconfig";
import type { BaseIssue, BaseSchema } from "valibot";

import { lilconfig } from "lilconfig";
import { safeParse, summarize } from "valibot";

const loadYaml: Loader = async (_filepath, content) => {
  const yaml = await import("yaml");

  // yaml.parse returns `any`, so keep it as `unknown` at the boundary.
  return yaml.parse(content) as unknown;
};

const configVariants = (name: string) => {
  return [
    `.${name}rc`,
    `.${name}rc.json`,
    `.${name}rc.yaml`,
    `.${name}rc.yml`,
    `.${name}rc.js`,
    `.${name}rc.cjs`,
    `.${name}rc.mjs`,
    `${name}.config.js`,
    `${name}.config.cjs`,
    `${name}.config.mjs`,
  ];
};

const getSearchPlaces = (configName: string) => {
  const variant = configVariants(configName);

  return [
    "package.json",
    ...variant,
    ...variant.map((place) => `.config/${place}`),
  ];
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
