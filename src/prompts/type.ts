import { dim } from 'ansi-colors'

import { EnquirerChoice, EnquirerPrompt, GitzyConfig } from '../interfaces'
import { fuzzySearch } from '../utils'
import { promptMessages } from './lang'

const choice = (
  { details, disableEmoji }: GitzyConfig,
  type: string
): EnquirerChoice => {
  const { description, emoji } = details[type]
  const prefix = emoji && !disableEmoji ? `${emoji} ` : ''

  return {
    title: `${type === 'refactor' ? `${prefix} ` : prefix}${type}:`,
    hint: description.toLowerCase(),
    indent: ' ',
    value: type,
  }
}

export const type = (config: GitzyConfig): EnquirerPrompt => {
  const choices = config.types.map((t: string) => choice(config, t))

  return {
    choices,
    hint: dim('...type or use arrow keys'),
    message: promptMessages.type,
    name: 'type',
    suggest: (input: string) =>
      fuzzySearch<EnquirerChoice>(choices, input, 'title'),
    type: 'autocomplete',
  }
}
