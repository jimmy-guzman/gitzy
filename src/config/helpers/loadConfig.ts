import { cosmiconfig } from 'cosmiconfig'
import path from 'path'

interface LoadConfigResult<T> {
  config: T
  filepath: string
  isEmpty?: boolean
}

const searchPlaces = (name: string) => [
  `.${name}rc`,
  `.${name}rc.json`,
  `.${name}rc.yaml`,
  `.${name}rc.yml`,
  `.${name}rc.js`,
  `.${name}rc.cjs`,
  `${name}.config.js`,
  `${name}.config.cjs`,
]

export const loadConfig = async <T>(
  configName: string,
  configPath?: string,
  cwd = process.cwd()
): Promise<LoadConfigResult<T> | null> => {
  const explorer = cosmiconfig(configName, {
    searchPlaces: [
      'package.json',
      ...searchPlaces(configName),
      ...searchPlaces(configName).map(p => `.config/${p}`),
    ],
  })
  const explicitPath = configPath ? path.resolve(cwd, configPath) : undefined
  const explore = explicitPath ? explorer.load : explorer.search
  const searchPath = explicitPath ? explicitPath : cwd

  return explore(searchPath)
}
