import { cosmiconfig } from 'cosmiconfig'

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
  const explorer = cosmiconfig(configName, {
    searchPlaces: getSearchPlaces(configName),
  })

  return explorer.search(process.cwd())
}
