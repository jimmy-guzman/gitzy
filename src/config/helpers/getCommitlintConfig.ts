import { validateUserConfig } from './validate-config'
import { cleanObject } from '../../utils'
import { loadConfig } from './loadConfig'

interface CommitlintOverrides {
  scopes?: string[]
  types?: string[]
  headerMaxLength?: number
  headerMinLength?: number
}

interface CommitlintConfig {
  rules: {
    'scope-enum'?: string[]
    'type-enum'?: string[]
    'header-max-length'?: string[]
    'header-min-length'?: string[]
  }
}

const getCommitLintOverrides = (
  config: CommitlintConfig
): CommitlintOverrides => {
  return cleanObject({
    scopes: config.rules?.['scope-enum']?.[2],
    types: config.rules?.['type-enum']?.[2],
    headerMaxLength: config?.rules?.['header-max-length']?.[2],
    headerMinLength: config?.rules?.['header-min-length']?.[2],
  })
}

export const getCommitlintConfig = async (): Promise<
  CommitlintOverrides | undefined
> => {
  const commitlint = await loadConfig<CommitlintConfig>('commitlint')

  if (commitlint) {
    const commitlintOverrides = getCommitLintOverrides(commitlint.config)
    const isValid = await validateUserConfig(commitlintOverrides)

    return isValid ? commitlintOverrides : undefined
  }

  return undefined
}
