import { lang } from './lang'
import {
  isArrayOfStrings,
  isBoolean,
  isNumber,
  isString,
  isValidDetails,
  isValidIssues,
} from './validators'

type Scheme = (value: unknown) => boolean | string

export const schema: Record<string, Scheme> = {
  breakingChangeEmoji: (value) => isString(value) || lang.breakingChangeEmoji,
  closedIssueEmoji: (value) => isString(value) || lang.closedIssueEmoji,
  details: (value) => isValidDetails(value) || lang.details,
  disableEmoji: (value) => isBoolean(value) || lang.disableEmoji,
  headerMaxLength: (value) => isNumber(value) || lang.headerMaxLength,
  headerMinLength: (value) => isNumber(value) || lang.headerMinLength,
  issuesHint: (value) => isString(value) || lang.issuesHint,
  issuesPrefix: (value) => isValidIssues(value) || lang.issuesPrefix,
  questions: (value) => isArrayOfStrings(value) || lang.questions,
  scopes: (value) => isArrayOfStrings(value) || lang.scopes,
  types: (value) => isArrayOfStrings(value) || lang.types,
  useCommitlintConfig: (value) => isBoolean(value) || lang.useCommitlintConfig,
}
