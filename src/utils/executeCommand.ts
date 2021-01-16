import { spawn } from 'child_process'
import kleur from 'kleur'

import { Answers, GitzyConfig } from '../interfaces'

const wrap = (string: string, width = 72) =>
  string.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'),
    '$1\n'
  )

const normalizeMessage = (message: string) =>
  message.replace(/"/g, '\\"').replace(/`/g, '\\`')

const createBreaking = (
  breaking: string,
  { disableEmoji, breakingChangeEmoji }: GitzyConfig
) =>
  breaking
    ? `\n\nBREAKING CHANGE: ${
        disableEmoji ? '' : `${breakingChangeEmoji} `
      }${breaking}`
    : ''

const createIssues = (
  issues: string,
  { disableEmoji, closedIssueEmoji }: GitzyConfig
) =>
  issues
    ? `\n\n${disableEmoji ? '' : `${closedIssueEmoji} `}Closes: ${issues}`
    : ''

const createScope = (scope: string) =>
  scope && scope !== 'none' ? `(${scope})` : ''

export const formatCommitMessage = (
  config: GitzyConfig,
  answers: Answers
): string => {
  const hasEmoji = !config.disableEmoji && config.details[answers.type].emoji
  const emojiPrefix = hasEmoji ? `${config.details[answers.type].emoji} ` : ''
  const scope = createScope(answers.scope)
  const head = `${answers.type + scope}: ${emojiPrefix}${answers.subject}`
  const body = answers.body ? `\n\n${answers.body}` : ''
  const breaking = createBreaking(answers.breaking, config)
  const issues = createIssues(answers.issues, config)

  return wrap(normalizeMessage(`${head}${body}${breaking}${issues}`))
}

const executeCommand = (
  command: string,
  args: string[] = [],
  env = process.env
): void => {
  const proc = spawn(command, args, {
    env,
    shell: true,
    stdio: [0, 1, 2],
  })

  proc.on('close', code => {
    process.exit(code)
  })
}

const executeDryRun = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(kleur.bold(`Message:`))
  // eslint-disable-next-line no-console
  console.log(message)
}

export const executeGitMessage = (
  { config, answers }: { config: GitzyConfig; answers: Answers },
  { args = [], dryRun = false }: { args: string[]; dryRun: boolean }
): void => {
  const message = formatCommitMessage(config, answers)

  if (dryRun) {
    return executeDryRun(message)
  }
  return executeCommand('git', ['commit', '-m', `"${message}"`, ...args])
}
