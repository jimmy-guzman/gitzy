import { flags } from '@oclif/command'

import { messages } from './messages'

export const commitFlags = {
  body: flags.string({
    char: 'd',
    multiple: false,
    description: messages.flags.body,
  }),
  breaking: flags.string({
    char: 'b',
    multiple: false,
    description: messages.flags.breaking,
  }),
  help: flags.help({ char: 'h' }),
  issue: flags.string({
    char: 'i',
    multiple: true,
    description: messages.flags.issue,
  }),
  passThrough: flags.string({
    char: 'p',
    multiple: true,
    description: messages.flags.passThrough,
  }),
  scope: flags.string({
    char: 's',
    multiple: false,
    description: messages.flags.scope,
  }),
  subject: flags.string({
    char: 'm',
    multiple: false,
    description: messages.flags.subject,
  }),
  type: flags.string({
    char: 't',
    multiple: false,
    description: messages.flags.type,
  }),
}
