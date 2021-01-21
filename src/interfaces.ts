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
  headerMaxLength: number
  headerMinLength: number
  questions: GitzyPrompts[]
  disableEmoji: boolean
  useCommitlintConfig: boolean
  types: string[]
}

export interface EnquirerChoice {
  title: string
  hint?: string
  indent?: string
  value: string
}

export interface EnquirerState {
  input: string
  answers: Answers
}
export interface EnquirerPrompt {
  choices?: EnquirerChoice[]
  hint?: string
  message: string | ((state?: EnquirerState) => string)
  name: string
  suggest?: (input: string) => Promise<EnquirerChoice[]>
  type: 'text' | 'autocomplete' | 'input'
  footer?: (state: EnquirerState) => string
  format?: (value: string) => string
  validate?: (input: string, state?: EnquirerState) => string | true
  skip?: boolean
  multiline?: boolean
}

export interface Flags {
  body?: string
  breaking?: string
  dryRun?: boolean
  emoji?: boolean
  issues?: string
  noEmoji?: boolean
  passthrough?: string[]
  scope?: string
  subject?: string
  type?: string
  commitlint?: boolean
  help?: boolean
  version?: boolean
}

export type CreatedPrompt = (
  config: GitzyConfig,
  answers: Answers,
  flags: Flags
) => EnquirerPrompt | null

export type UnknownObject = Record<string, unknown>
