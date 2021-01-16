import { EnquirerPrompt } from '../interfaces'
import { promptMessages } from './lang'

export const body = (): EnquirerPrompt => {
  return {
    hint: '...supports multi line, press enter to go to next line',
    message: promptMessages.body,
    multiline: true,
    name: 'body',
    type: 'text',
  }
}
