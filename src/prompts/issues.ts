import { CreatedPrompt } from '../interfaces'
import { issuesMessage } from './lang'

export const issues: CreatedPrompt = ({ config: { issuesPrefix } }) => ({
  message: issuesMessage(issuesPrefix),
  name: 'issues',
  type: 'text',
})
