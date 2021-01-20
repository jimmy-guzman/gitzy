import { CreatedPrompt } from '../interfaces'
import { promptMessages } from './lang'

export const breaking: CreatedPrompt = () => {
  return {
    message: promptMessages.breaking,
    name: 'breaking',
    type: 'text',
  }
}
