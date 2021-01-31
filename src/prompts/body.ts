import { CreatedPrompt } from '../interfaces'
import { promptMessages } from './lang'

export const body: CreatedPrompt = () => {
  return {
    format: (value): string => value.trim(),
    hint: '...supports multi line, press enter to go to next line',
    message: promptMessages.body,
    multiline: true,
    name: 'body',
    type: 'text',
  }
}
