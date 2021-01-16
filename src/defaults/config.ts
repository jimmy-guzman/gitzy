import { GitzyConfig, Questions } from '../interfaces'
import { details } from './details'

const questions: Questions[] = [
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
  maxMessageLength: 64,
  minMessageLength: 3,
  questions,
  scopes: [],
  types: ['chore', 'docs', 'feat', 'fix', 'refactor', 'test'],
  useCommitlintConfig: false,
}
