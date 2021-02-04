import { validIssuesPrefixes } from './constants'

export const lang = {
  breakingChangeEmoji: 'breakingChangeEmoji must be a string',
  closedIssueEmoji: 'closedIssueEmoji must be a string',
  details:
    'details must look like "{ description: "A new feature", emoji: "✨" }"',
  disableEmoji: 'disableEmoji must be a boolean',
  headerMaxLength: 'headerMaxLength must be a number',
  headerMinLength: 'headerMinLength must be a number',
  issuesPrefix: `issuesPrefix must be one of ${validIssuesPrefixes.join(', ')}`,
  questions: 'questions must be an array of strings',
  scopes: 'scopes must be an array of strings',
  types: 'types must be an array of strings',
  useCommitlintConfig: 'useCommitlintConfig must be a boolean',
}
