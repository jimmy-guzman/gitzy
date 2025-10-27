import type { Loader } from "lilconfig";
import type { BaseIssue, BaseSchema } from "valibot";

import { lilconfig } from "lilconfig";
import { isValiError, parseAsync, summarize } from "valibot";
import yaml from "yaml";

const loadYaml: Loader = (_filepath, content) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- parse returns any
  return yaml.parse(content);
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
    ...variant.map((place) => {
      return `.config/${place}`;
    }),
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

  try {
    return await parseAsync(schema, result.config);
  } catch (error) {
    if (isValiError(error)) {
      throw new TypeError(summarize(error.issues), { cause: error });
    }

    throw new TypeError("Invalid configuration", { cause: error });
  }
};
