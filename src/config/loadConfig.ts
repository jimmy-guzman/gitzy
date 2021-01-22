import { cosmiconfig } from 'cosmiconfig'
import path from 'path'

interface LoadConfigResult<T> {
  config: T
  filepath: string
  isEmpty?: boolean
}

export const loadConfig = async <T>(
  configName: string,
  configPath?: string,
  cwd = process.cwd()
): Promise<LoadConfigResult<T> | null> => {
  const explorer = cosmiconfig(configName)
  const explicitPath = configPath ? path.resolve(cwd, configPath) : undefined
  const explore = explicitPath ? explorer.load : explorer.search
  const searchPath = explicitPath ? explicitPath : cwd

  return explore(searchPath)
}
