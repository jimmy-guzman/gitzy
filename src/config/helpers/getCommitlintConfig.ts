import { validateUserConfig } from './validate-config'
import { cleanObject } from '../../utils'
import { loadConfig } from './loadConfig'

interface CommitlintOverrides {
  headerMaxLength?: number
  headerMinLength?: number
  scopes?: string[]
  types?: string[]
}

interface CommitlintConfig {
  rules?: {
    'header-max-length'?: [number, string, number]
    'header-min-length'?: [number, string, number]
    'scope-case'?: [number, string, string]
    'scope-enum'?: [number, string, string[]]
    'type-enum'?: [number, string, string[]]
  }
}

export const getCommitlintOverrides = (
  config: CommitlintConfig
): CommitlintOverrides => {
  return cleanObject({
    headerMaxLength: config.rules?.['header-max-length']?.[2],
    headerMinLength: config.rules?.['header-min-length']?.[2],
    scopes: config.rules?.['scope-enum']?.[2],
    types: config.rules?.['type-enum']?.[2],
  })
}

export const getCommitlintConfig = async (): Promise<CommitlintOverrides | null> => {
  const commitlint = await loadConfig<CommitlintConfig>('commitlint')

  if (commitlint) {
    const commitlintOverrides = getCommitlintOverrides(commitlint.config)
    const isValid = await validateUserConfig(commitlintOverrides)

    return isValid ? commitlintOverrides : null
  }

  return null
}
