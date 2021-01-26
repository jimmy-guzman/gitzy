import { bold, green, red, yellow } from 'ansi-colors'

import { leadingLabel, subject } from './subject'
import { defaultConfig } from '../defaults'
import { Answers, EnquirerPrompt, EnquirerState } from '../interfaces'

interface Custom extends Omit<Required<EnquirerPrompt>, 'message'> {
  message: (state?: EnquirerState | undefined) => string
}

const setupSubject = (config = {}) => {
  return subject({ ...defaultConfig, ...config }, {} as Answers, {}) as Custom
}

const answers = {
  body: 'this an amazing feature, lots of details',
  breaking: 'breaks everything',
  issues: '#123',
  scope: '*',
  subject: 'a cool new feature',
  type: 'feat',
}

describe('leadingLabel', () => {
  it("should create subject's leading label with scope", () => {
    expect(leadingLabel(answers)).toBe('feat(*):')
  })
  it("should create subject's leading label with scope & no answers", () => {
    expect(leadingLabel({} as Answers)).toBe('')
  })
  it('should create subject leading label with no scope', () => {
    expect(leadingLabel({ ...answers, scope: '' })).toBe('feat:')
  })
})

describe('subject', () => {
  it('should create default subject', () => {
    const subjectQuestion = setupSubject()

    expect(subjectQuestion).toStrictEqual(
      expect.objectContaining({
        message: expect.any(Function),
        name: 'subject',
        type: 'input',
        validate: expect.any(Function),
      })
    )
  })

  describe('validate', () => {
    it('should return min error message when the length is not valid', () => {
      const { validate } = setupSubject()

      expect(validate('#'.repeat(2))).toBe(
        'The subject must have at least 3 characters'
      )
    })
    it('should return max error message when the length is not valid', () => {
      const { validate } = setupSubject()

      expect(validate('#'.repeat(65))).toBe(
        'The subject must be less than 64 characters'
      )
    })
    it('should return true when the length is valid', () => {
      const { validate } = setupSubject()

      expect(validate('#'.repeat(5))).toBe(true)
    })
    it('should return return true adjust per user scope', () => {
      const { validate } = setupSubject()

      expect(validate('#'.repeat(53), { answers, input: '' })).toBe(true)
    })
    it('should return return true if emojis disabled', () => {
      const { validate } = setupSubject({ disableEmoji: true })

      expect(validate('#'.repeat(56), { answers, input: '' })).toBe(true)
    })
  })
  describe('message', () => {
    it('should return indicator when inputLength < headerMinLength', () => {
      const { message } = setupSubject()

      expect(message({ answers, input: '' })).toBe(
        bold(`Add a short description(${red('53/64')})`)
      )
    })
    it('should return indicator when percentRemaining > 25', () => {
      const { message } = setupSubject()

      expect(message({ answers, input: '#'.repeat(5) })).toBe(
        bold(`Add a short description(${green('48/64')})`)
      )
    })
    it('should return indicator when percentRemaining < 0', () => {
      const { message } = setupSubject()

      expect(message({ answers, input: '#'.repeat(65) })).toBe(
        bold(`Add a short description(${red('-12/64')})`)
      )
    })
    it('should return indicator', () => {
      const { message } = setupSubject()

      expect(message({ answers, input: '#'.repeat(53) })).toBe(
        bold(`Add a short description(${yellow('0/64')})`)
      )
    })
    it('should return indicator when no state', () => {
      const { message } = setupSubject()

      expect(message(undefined)).toBe(
        bold(`Add a short description(${red('61/64')})`)
      )
    })
  })
})
