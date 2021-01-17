import { Choice, PromptObject } from 'prompts'

import { GitzyConfig } from '../interfaces'
import { fuzzySearch } from '../utils'
import { promptMessages } from './lang'

export const scope = ({ scopes }: GitzyConfig): PromptObject => {
  const hasScopes = scopes && scopes.length > 0
  const choices = scopes.map((s: string) => ({ title: s, value: s }))

  return {
    choices,
    message: promptMessages.scope,
    name: 'scope',
    suggest: (input: string) => fuzzySearch<Choice>(choices, input, 'title'),
    type: hasScopes ? 'autocomplete' : false,
  }
}
