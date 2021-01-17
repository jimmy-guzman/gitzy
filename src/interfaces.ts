export type GitzyPrompts =
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

/**
 * https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
 */
export type IssuesPrefixes =
  | 'close'
  | 'closes'
  | 'closed'
  | 'fix'
  | 'fixes'
  | 'fixed'
  | 'resolve'
  | 'resolves'
  | 'resolved'

export interface GitzyConfig {
  details: Details
  breakingChangeEmoji: string
  closedIssueEmoji: string
  issuesPrefix: IssuesPrefixes
  scopes: string[]
  maxMessageLength: number
  minMessageLength: number
  questions: GitzyPrompts[]
  disableEmoji: boolean
  useCommitlintConfig: boolean
  types: string[]
}
