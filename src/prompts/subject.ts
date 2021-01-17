import { Answers, GitzyConfig } from '../interfaces'
import { CustomPromptObject } from './interfaces'
import { errorMessage, promptMessages } from './lang'
import { highlightCursor } from './utils'

export const leadingLabel = (answers: Answers): string => {
  const hasScope = answers.scope && answers.scope !== 'none'
  const scope = hasScope ? `(${answers.scope})` : ''

  return `${answers.type}${scope}:`
}

export const formatSubject = (input: string): string =>
  input.trim().replace(/\.$/, '')

export const subject = (
  { minMessageLength, maxMessageLength, disableEmoji }: GitzyConfig,
  userAnswers: Answers
): CustomPromptObject => {
  const minTitleLengthError = errorMessage.minTitleLength(minMessageLength)
  const maxTitleLengthError = errorMessage.maxTitleLength(maxMessageLength)
  const message = promptMessages.subject
  const emojiLength = disableEmoji ? 0 : 3
  const label = leadingLabel(userAnswers)

  return {
    format: formatSubject,
    message,
    name: 'subject',
    onRender({ yellow, green, red, reset }) {
      const getCharsLeftText = (): string => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const input = this._value.length
        const remainingChar =
          maxMessageLength - input - label.length - emojiLength
        const percentRemaining = (remainingChar / maxMessageLength) * 100
        const charsLeftIndicator = `${remainingChar}/${maxMessageLength}`

        if (input < minMessageLength) {
          return red(charsLeftIndicator)
        }
        if (percentRemaining > 25) {
          return green(charsLeftIndicator)
        }
        if (percentRemaining < 0) {
          return red(charsLeftIndicator)
        }
        return yellow(charsLeftIndicator)
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.rendered = highlightCursor(this._value, this.cursor)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.msg = `${message} (${getCharsLeftText()}) \n${reset().dim(label)}`
    },
    type: 'text',
    validate: (input: string): string | true => {
      if (input.length < minMessageLength) {
        return minTitleLengthError
      }
      if (input.length + label.length + emojiLength > maxMessageLength) {
        return maxTitleLengthError
      }

      return true
    },
  }
}
