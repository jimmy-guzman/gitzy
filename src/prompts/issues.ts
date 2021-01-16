import { EnquirerPrompt, GitzyConfig } from '../interfaces'
import { issuesMessage } from './lang'

export const issues = ({ issuesPrefix }: GitzyConfig): EnquirerPrompt => ({
  message: issuesMessage(issuesPrefix),
  name: 'issues',
  type: 'text',
})
