import FuzzySearch from 'fuzzy-search'
import { PromptObject } from 'prompts'

import { GitzyConfig } from '../interfaces'

export const scope = ({ scopes }: GitzyConfig): PromptObject => {
  const hasScopes = scopes && scopes.length > 0
  const choices = scopes.map((s: string) => ({ title: s, value: s }))
  const searcher = new FuzzySearch(choices, ['title'], { caseSensitive: false })

  return {
    choices,
    message: 'Select the scope this component affects:',
    name: 'scope',
    suggest: (input: string) => Promise.resolve(searcher.search(input)),
    type: hasScopes ? 'autocomplete' : false,
  }
}
