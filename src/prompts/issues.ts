import { PromptObject } from 'prompts'

export const issues = (): PromptObject => ({
  message: 'Issues this commit closes, e.g #123:',
  name: 'issues',
  type: 'text',
})
