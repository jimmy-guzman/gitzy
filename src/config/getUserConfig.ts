import { GitzyConfig } from '../interfaces'
import { validateUserConfig } from '../utils'
import { getCommitlintConfig } from './getCommitlintConfig'
import { loadConfig } from './loadConfig'

export const getUserConfig = async (
  commitlint?: boolean
): Promise<GitzyConfig | null> => {
  const loaded = await loadConfig<GitzyConfig>('gitzy')

  if (commitlint && !loaded) {
    return getCommitlintConfig() as Promise<GitzyConfig>
  }

  if (loaded) {
    const isValid = await validateUserConfig(loaded.config)

    if (isValid) {
      if (loaded.config.useCommitlintConfig) {
        const commitlintConfig = await getCommitlintConfig()

        return { ...loaded.config, ...commitlintConfig }
      }

      return { ...loaded.config }
    }
  }

  return null
}
