import { reset } from 'kleur'

import { IssuesPrefixes } from '../interfaces'

const breaking = reset().red().dim('BREAKING CHANGE:')
const closes = (issuesPrefix: IssuesPrefixes) => reset().dim(`${issuesPrefix}:`)

export const promptMessages: Record<string, string> = {
  body: 'Add a longer description of the change\n',
  breaking: `Add any breaking changes\n  ${breaking}`,
  scope: 'Choose the context of the change',
  subject: 'Add a short description of the change',
  type: 'Choose the kind of change',
}

export const issuesMessage = (issuesPrefix: IssuesPrefixes): string =>
  `Add issues this commit closes, e.g #123\n  ${closes(issuesPrefix)}`

export const errorMessage = {
  minTitleLength: (length: number): string =>
    `The subject must have at least ${length} characters`,
  maxTitleLength: (length: number): string =>
    `The subject must be less than ${length} characters`,
}
