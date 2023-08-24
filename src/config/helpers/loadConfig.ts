import { lilconfig } from 'lilconfig'

interface LoadConfigResult<T> {
  config: T
  filepath: string
  isEmpty?: boolean
}

export const loadConfig = async <T>(
  configName: string
): Promise<LoadConfigResult<T> | null> => {
  const explorer = lilconfig(configName)

  return explorer.search(process.cwd())
}
