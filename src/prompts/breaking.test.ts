import { breaking } from './breaking'
import { defaultConfig } from '../defaults'
import { EnquirerPrompt } from '../interfaces'

describe('breaking', () => {
  it('should create body prompt', () => {
    const breakingPrompt = breaking({
      config: defaultConfig,
      answers: {
        body: '',
        breaking: '',
        issues: '',
        scope: '',
        subject: '',
        type: '',
      },
      flags: {},
    }) as Required<EnquirerPrompt>

    expect(breakingPrompt).toStrictEqual({
      hint: '[2m...skip when none[22m',
      message: `[1mAdd any breaking changes[22m
  [31mBREAKING CHANGE:[39m`,
      name: 'breaking',
      type: 'text',
    })
  })
})