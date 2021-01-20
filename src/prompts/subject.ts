import { green, red, yellow, bold } from 'ansi-colors'

import { CreatedPrompt, EnquirerState, Answers } from '../interfaces'
import { errorMessage, promptMessages } from './lang'

export const leadingLabel = (answers?: Answers): string => {
  const hasScope = answers?.scope && answers.scope !== 'none'
  const scope = hasScope ? `(${answers?.scope})` : ''

  return `${answers?.type}${scope}:`
}

export const subject: CreatedPrompt = ({
  headerMinLength,
  headerMaxLength,
  disableEmoji,
}) => {
  const minTitleLengthError = errorMessage.minTitleLength(headerMinLength)
  const maxTitleLengthError = errorMessage.maxTitleLength(headerMaxLength)
  const message = promptMessages.subject
  const emojiLength = disableEmoji ? 0 : 3

  return {
    message: (state?: EnquirerState) => {
      const getCharsLeftText = (): string => {
        const label = leadingLabel(state?.answers)
        const inputLength = state ? state.input.length : 0
        const remainingChar =
          headerMaxLength - inputLength - label.length - emojiLength
        const percentRemaining = (remainingChar / headerMaxLength) * 100
        const charsLeftIndicator = `${remainingChar}/${headerMaxLength}`

        if (inputLength < headerMinLength) {
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

      return bold(`${message}(${getCharsLeftText()})`)
    },
    name: 'subject',
    type: 'input',
    validate: (input: string, state?: EnquirerState): string | true => {
      const label = leadingLabel(state?.answers)

      if (input.length < headerMinLength) {
        return minTitleLengthError
      }
      if (input.length + label.length + emojiLength > headerMaxLength) {
        return maxTitleLengthError
      }

      return true
    },
  }
}
