import { GitzyConfig } from '../interfaces'
import { validateUserConfig } from '../utils'
import { getCommitlintConfig, loadConfig } from './helpers'

export const getUserConfig = async (
  config: GitzyConfig
): Promise<GitzyConfig | undefined> => {
  const loaded = await loadConfig<GitzyConfig>('gitzy')

  if (loaded) {
    const isValid = await validateUserConfig(loaded.config)

    if (isValid) {
      if (loaded.config.useCommitlintConfig) {
        const commitlintConfig = await getCommitlintConfig()

        return { ...config, ...loaded.config, ...commitlintConfig }
      }

      return { ...config, ...loaded.config }
    }
  }
  return undefined
}
