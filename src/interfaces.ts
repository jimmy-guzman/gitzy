export type Questions =
  | 'type'
  | 'scope'
  | 'subject'
  | 'body'
  | 'breaking'
  | 'issues'

export interface Detail {
  description: string
  emoji: string
}

export type Details = Record<string, Detail>

export interface Answers {
  body: string
  breaking: string
  issues: string
  scope: string
  subject: string
  type: string
}

export interface GitzyConfig {
  details: Details
  breakingChangeEmoji: string
  closedIssueEmoji: string
  scopes: string[]
  maxMessageLength: number
  minMessageLength: number
  questions: Questions[]
  disableEmoji: boolean
  useCommitlintConfig: boolean
  types: string[]
}

export type UserConfig = Partial<GitzyConfig>
