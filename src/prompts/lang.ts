import { bold, red, reset } from 'ansi-colors'

import { IssuesPrefixes } from '../interfaces'

const breaking = red('BREAKING CHANGE:')

const closes = (issuesPrefix: IssuesPrefixes): string => {
  return reset(`${issuesPrefix}:`)
}

export const promptMessages: Record<string, string> = {
  body: 'Add a longer description\n',
  breaking: `${bold('Add any breaking changes')}\n  ${breaking}`,
  scope: 'Choose the scope',
  subject: 'Add a short description',
  type: 'Choose the type',
}

export const issuesMessage = (issuesPrefix: IssuesPrefixes): string => {
  return `${bold('Add issues this commit closes, e.g #123')}\n  ${closes(
    issuesPrefix
  )}`
}

export const errorMessage = {
  minTitleLength: (length: number): string =>
    `The subject must have at least ${length} characters`,
  maxTitleLength: (length: number): string =>
    `The subject must be less than ${length} characters`,
}
