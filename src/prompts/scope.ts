import { dim } from 'ansi-colors'

import { EnquirerChoice, EnquirerPrompt, GitzyConfig } from '../interfaces'
import { fuzzySearch } from '../utils'
import { promptMessages } from './lang'

export const scope = ({ scopes }: GitzyConfig): EnquirerPrompt => {
  const choices = scopes.map((s: string) => ({
    indent: ' ',
    title: s,
    value: s,
  }))

  return {
    choices,
    hint: dim('...type or use arrow keys'),
    message: promptMessages.scope,
    name: 'scope',
    suggest: (input: string) =>
      fuzzySearch<EnquirerChoice>(choices, input, 'title'),
    // TODO: use skip once https://github.com/enquirer/enquirer/issues/128 is resolved
    type: scopes.length > 0 ? 'autocomplete' : 'text',
  }
}
