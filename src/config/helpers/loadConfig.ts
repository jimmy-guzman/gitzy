import type { Loader } from "lilconfig";

import { lilconfig } from "lilconfig";
import yaml from "yaml";

const loadYaml: Loader = (_filepath, content) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- parse returns any
  return yaml.parse(content);
};

interface LoadConfigResult<T> {
  config: T;
  filepath: string;
  isEmpty?: boolean;
}

const defaultSearchPlaces = (name: string) => {
  return [
    `.${name}rc`,
    `.${name}rc.json`,
    `.${name}rc.yaml`,
    `.${name}rc.yml`,
    `.${name}rc.js`,
    `.${name}rc.cjs`,
    `${name}.config.js`,
    `${name}.config.cjs`,
  ];
};

export const getSearchPlaces = (configName: string) => {
  return [
    "package.json",
    ...defaultSearchPlaces(configName),
    ...defaultSearchPlaces(configName).map((searchPlace) => {
      return `.config/${searchPlace}`;
    }),
  ];
};

export const loadConfig = async <T>(
  configName: string,
): Promise<LoadConfigResult<T> | null> => {
  const explorer = lilconfig(configName, {
    loaders: {
      ".yaml": loadYaml,
      ".yml": loadYaml,
      "noExt": loadYaml,
    },
    searchPlaces: getSearchPlaces(configName),
  });

  return explorer.search(process.cwd());
};
