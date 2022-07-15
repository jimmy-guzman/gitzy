import type { CreatedPrompt } from '../interfaces'

import { promptsLang } from './lang'

export const breaking: CreatedPrompt = () => {
  return {
    hint: promptsLang.breaking.hint,
    message: promptsLang.breaking.message,
    name: 'breaking',
    type: 'text',
  }
}
