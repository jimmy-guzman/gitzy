import { dim } from 'ansi-colors'

import {
  CreatedPrompt,
  EnquirerChoice,
  Flags,
  GitzyConfig,
} from '../interfaces'
import { fuzzySearch } from '../utils'
import { promptMessages } from './lang'

const choice = (
  { details, disableEmoji }: GitzyConfig,
  type: string,
  { emoji: emojiFlag }: Flags
): EnquirerChoice => {
  const { description, emoji } = details[type]
  const hasEmoji = emoji && !disableEmoji && emojiFlag
  const prefix = hasEmoji ? `${emoji} ` : ''

  return {
    title: `${type === 'refactor' && hasEmoji ? `${prefix} ` : prefix}${type}:`,
    hint: description.toLowerCase(),
    indent: ' ',
    value: type,
  }
}

export const type: CreatedPrompt = (config, _answers, flags) => {
  const choices = config.types.map((t: string) => choice(config, t, flags))

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
