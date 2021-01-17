import FuzzySearch from 'fuzzy-search'
import { Choice, PromptObject } from 'prompts'

import { GitzyConfig } from '../interfaces'
import { promptMessages } from './lang'

const choice = (
  { details, disableEmoji }: GitzyConfig,
  type: string
): Choice => {
  const { description, emoji } = details[type]
  const prefix = emoji && !disableEmoji ? `${emoji} ` : ''

  return {
    title: `${prefix}${type}`,
    description,
    value: type,
  }
}

export const type = (config: GitzyConfig): PromptObject => {
  const choices = config.types.map((t: string) => choice(config, t))
  const searcher = new FuzzySearch(choices, ['title'], { caseSensitive: false })

  return {
    choices,
    message: promptMessages.type,
    name: 'type',
    suggest: (input: string) => Promise.resolve(searcher.search(input)),
    type: 'autocomplete',
  }
}
