import { lilconfig } from 'lilconfig'
import yaml from 'yaml'

import type { Loader } from 'lilconfig'

const loadYaml: Loader = (_filepath, content) => {
  return yaml.parse(content)
}

interface LoadConfigResult<T> {
  config: T
  filepath: string
  isEmpty?: boolean
}

const defaultSearchPlaces = (name: string): string[] => [
  `.${name}rc`,
  `.${name}rc.json`,
  `.${name}rc.yaml`,
  `.${name}rc.yml`,
  `.${name}rc.js`,
  `.${name}rc.cjs`,
  `${name}.config.js`,
  `${name}.config.cjs`,
]

export const getSearchPlaces = (configName: string): string[] => [
  'package.json',
  ...defaultSearchPlaces(configName),
  ...defaultSearchPlaces(configName).map(
    (searchPlace) => `.config/${searchPlace}`
  ),
]

export const loadConfig = async <T>(
  configName: string
): Promise<LoadConfigResult<T> | null> => {
  const explorer = lilconfig(configName, {
    searchPlaces: getSearchPlaces(configName),
    loaders: {
      '.yaml': loadYaml,
      '.yml': loadYaml,
      'noExt': loadYaml,
    },
  })

  return explorer.search(process.cwd())
}
