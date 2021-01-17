import { PromptObject } from 'prompts'

import { GitzyConfig } from '../interfaces'
import { issuesMessage } from './lang'

export const issues = ({ issuesPrefix }: GitzyConfig): PromptObject => ({
  message: issuesMessage(issuesPrefix),
  name: 'issues',
  type: 'text',
})
