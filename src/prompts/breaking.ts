import { EnquirerPrompt } from '../interfaces'
import { promptMessages } from './lang'

export const breaking = (): EnquirerPrompt => {
  return {
    message: promptMessages.breaking,
    name: 'breaking',
    type: 'text',
  }
}
