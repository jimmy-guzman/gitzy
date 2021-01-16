import { GitzyConfig, GitzyPrompts } from '../interfaces'
import { details } from './details'

const questions: GitzyPrompts[] = [
  'type',
  'scope',
  'subject',
  'body',
  'breaking',
  'issues',
]

export const defaultConfig: GitzyConfig = {
  breakingChangeEmoji: '🧨',
  closedIssueEmoji: '🏁',
  details,
  disableEmoji: false,
  headerMaxLength: 64,
  headerMinLength: 3,
  issuesPrefix: 'closes',
  questions,
  scopes: [],
  types: ['chore', 'docs', 'feat', 'fix', 'refactor', 'test', 'style'],
  useCommitlintConfig: false,
}
