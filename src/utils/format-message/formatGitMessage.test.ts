/* eslint-disable jest/no-large-snapshots */
import { formatCommitMessage } from './formatGitMessage'
import { defaultConfig } from '../../defaults'

const setupFormatCommitMessage = (config = {}, answers = {}): string => {
  return formatCommitMessage(
    { ...defaultConfig, ...config },
    {
      body: 'this an amazing feature, lots of details',
      breaking: 'breaks everything',
      issues: '#123',
      scope: '*',
      subject: 'a cool new feature',
      type: 'feat',
      ...answers,
    },
    true
  )
}

describe('formatCommitMessage', () => {
  it('should format commit message with everything', () => {
    const formattedMessage = setupFormatCommitMessage()

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `)
  })

  it('should format commit message with no emojis', () => {
    const formattedMessage = setupFormatCommitMessage({ disableEmoji: true })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: breaks everything

      Closes: #123"
    `)
  })

  it('should format commit message with no body', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `)
  })

  it('should format commit message with multiline body', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: '\n',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `)
  })

  it('should format commit message with no scope', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      scope: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat: ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything

      🏁 Closes: #123"
    `)
  })

  it('should format commit message with no issues', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      issues: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 💥 breaks everything"
    `)
  })

  it('should format commit message with no breaking change', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      breaking: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this an amazing feature, lots of details

      🏁 Closes: #123"
    `)
  })

  it('should wrap commit message', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body: 'this is a very very very very very very very very very very very very very very very very very very very long description',
      breaking:
        'this is a very very very very very very very very very very very very very very very very very very very long breaking change',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): ✨ a cool new feature

      this is a very very very very very very very very very very very very
      very very very very very very very long description

      BREAKING CHANGE: 💥 this is a very very very very very very very very
      very very very very very very very very very very very long breaking
      change

      🏁 Closes: #123"
    `)
  })
  it('should allow double quotes in message', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      subject: 'this has "quotes"',
      body: '',
      breaking: '',
      issues: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this has \\\\\\"quotes\\\\\\""`
    )
  })
  it('should allow backtick quotes in message', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      subject: 'this has `quotes`',
      body: '',
      breaking: '',
      issues: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): ✨ this has \\\\\`quotes\\\\\`"`
    )
  })
})
