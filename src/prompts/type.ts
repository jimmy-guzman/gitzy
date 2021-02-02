import { dim } from 'ansi-colors'

import {
  CreatedPrompt,
  EnquirerChoice,
  Flags,
  GitzyConfig,
} from '../interfaces'
import { fuzzySearch } from '../utils'
import { promptMessages } from './lang'

export const choice = (
  { details, disableEmoji }: GitzyConfig,
  type: string,
  flags?: Flags
): EnquirerChoice => {
  const { description, emoji } = details[type]
  const hasEmoji = emoji && !disableEmoji && flags?.emoji
  const prefix = hasEmoji ? `${emoji} ` : ''

  return {
    title: `${type === 'refactor' && hasEmoji ? `${prefix} ` : prefix}${type}:`,
    hint: description.toLowerCase(),
    indent: ' ',
    value: type,
  }
}

export const type: CreatedPrompt = ({ config, flags }) => {
  const choices = config.types.map((t: string) => choice(config, t, flags))

  return {
    choices,
    hint: dim('...type or use arrow keys'),
    limit: 10,
    message: promptMessages.type,
    name: 'type',
    suggest: (input: string): Promise<EnquirerChoice[]> =>
      fuzzySearch<EnquirerChoice>(choices, input, 'title'),
    type: 'autocomplete',
  }
}
