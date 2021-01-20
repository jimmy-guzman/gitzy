import { CreatedPrompt } from '../interfaces'
import { issuesMessage } from './lang'

export const issues: CreatedPrompt = ({ issuesPrefix }) => ({
  message: issuesMessage(issuesPrefix),
  name: 'issues',
  type: 'text',
})
