import { GitzyConfig, Answers } from '../../interfaces'

const MAX_WIDTH = 72

export const wrap = (string: string, maxWidth = MAX_WIDTH): string => {
  const regex = new RegExp(
    `(?![^\\n]{1,${maxWidth}}$)([^\\n]{1,${maxWidth}})\\s`,
    'g'
  )

  return string.replace(regex, '$1\n')
}

const normalizeMessage = (message: string): string => {
  return message.replace(/"/g, '\\"').replace(/`/g, '\\`')
}

const createBreaking = (
  breaking: string,
  { disableEmoji, breakingChangeEmoji }: GitzyConfig
): string => {
  return breaking
    ? `\n\nBREAKING CHANGE: ${
        disableEmoji ? '' : `${breakingChangeEmoji} `
      }${breaking}`
    : ''
}

const createIssues = (
  issues: string,
  { disableEmoji, closedIssueEmoji }: GitzyConfig
): string => {
  return issues
    ? `\n\n${disableEmoji ? '' : `${closedIssueEmoji} `}Closes: ${issues}`
    : ''
}

const createScope = (scope: string): string => {
  return scope && scope !== 'none' ? `(${scope})` : ''
}

export const formatCommitMessage = (
  config: GitzyConfig,
  answers: Answers,
  emoji: boolean
): string => {
  const hasEmoji =
    !config.disableEmoji && config.details[answers.type].emoji && emoji
  const emojiPrefix = hasEmoji ? `${config.details[answers.type].emoji} ` : ''
  const scope = createScope(answers.scope)
  const head = `${answers.type + scope}: ${emojiPrefix}${answers.subject}`
  const body = answers.body.trim() ? `\n\n${answers.body}` : ''
  const breaking = createBreaking(answers.breaking, config)
  const issues = createIssues(answers.issues, config)
  const maxWidth =
    config.headerMaxLength > MAX_WIDTH ? config.headerMaxLength : MAX_WIDTH

  return wrap(normalizeMessage(`${head}${body}${breaking}${issues}`), maxWidth)
}
