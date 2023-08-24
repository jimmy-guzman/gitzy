import type { CreatedPrompt, EnquirerChoice } from '../interfaces'

import { promptsLang } from './lang'
import { fuzzySearch } from '../utils'

export const scope: CreatedPrompt = ({ config: { scopes } }) => {
  const choices = scopes.map((choice) => ({
    indent: ' ',
    title: choice,
    value: choice,
  }))

  // TODO: use skip once https://github.com/enquirer/enquirer/issues/128 is resolved
  return scopes.length > 0
    ? {
        choices,
        hint: promptsLang.scope.hint,
        limit: 10,
        message: promptsLang.scope.message,
        name: 'scope',
        suggest: (input: string): Promise<EnquirerChoice[]> => {
          return fuzzySearch<EnquirerChoice>(choices, input, 'title')
        },
        type: 'autocomplete',
      }
    : null
}
