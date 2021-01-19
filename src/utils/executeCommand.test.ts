/* eslint-disable jest/no-large-snapshots */

import { formatCommitMessage } from './executeCommand'
import { defaultConfig } from '../defaults'

const setupFormatCommitMessage = (config = {}, answers = {}) => {
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
      "feat(*): 🎸 a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 🧨 breaks everything

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
      "feat(*): 🎸 a cool new feature

      BREAKING CHANGE: 🧨 breaks everything

      🏁 Closes: #123"
    `)
  })

  it('should format commit message with no scope', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      scope: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat: 🎸 a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 🧨 breaks everything

      🏁 Closes: #123"
    `)
  })

  it('should format commit message with no issues', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      issues: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): 🎸 a cool new feature

      this an amazing feature, lots of details

      BREAKING CHANGE: 🧨 breaks everything"
    `)
  })

  it('should format commit message with no breaking change', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      breaking: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): 🎸 a cool new feature

      this an amazing feature, lots of details

      🏁 Closes: #123"
    `)
  })

  it('should wrap commit message', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      body:
        'volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque eleifend donec',
      breaking:
        'volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque eleifend donec pretium',
    })

    expect(formattedMessage).toMatchInlineSnapshot(`
      "feat(*): 🎸 a cool new feature

      volutpat commodo sed egestas egestas fringilla phasellus faucibus
      scelerisque eleifend donec

      BREAKING CHANGE: 🧨 volutpat commodo sed egestas egestas fringilla
      phasellus faucibus scelerisque eleifend donec pretium

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
      `"feat(*): 🎸 this has \\\\\\"quotes\\\\\\""`
    )
  })
  it('should allow backticks quotes in message', () => {
    const formattedMessage = setupFormatCommitMessage(defaultConfig, {
      subject: 'this has `quotes`',
      body: '',
      breaking: '',
      issues: '',
    })

    expect(formattedMessage).toMatchInlineSnapshot(
      `"feat(*): 🎸 this has \\\\\`quotes\\\\\`"`
    )
  })
})
