import { dim } from 'ansi-colors'

import { EnquirerChoice, EnquirerPrompt, GitzyConfig } from '../interfaces'
import { fuzzySearch } from '../utils'
import { promptMessages } from './lang'

export const scope = ({ scopes }: GitzyConfig): EnquirerPrompt | null => {
  const choices = scopes.map(s => ({ indent: ' ', title: s, value: s }))

  // TODO: use skip once https://github.com/enquirer/enquirer/issues/128 is resolved
  return scopes.length > 0
    ? {
        choices,
        hint: dim('...type or use arrow keys'),
        message: promptMessages.scope,
        name: 'scope',
        suggest: (input: string) =>
          fuzzySearch<EnquirerChoice>(choices, input, 'title'),

        type: 'autocomplete',
      }
    : null
}
