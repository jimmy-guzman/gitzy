import { body } from './body'
import { defaultConfig } from '../defaults'
import { EnquirerPrompt } from '../interfaces'

describe('body', () => {
  it('should create body prompt', () => {
    const bodyPrompt = body({
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

    expect(bodyPrompt).toStrictEqual({
      format: expect.any(Function),
      hint: '...supports multi line, press enter to go to next line',
      message: 'Add a longer description\n',
      multiline: true,
      name: 'body',
      type: 'text',
    })
    expect(bodyPrompt.format(' whitespace ')).toBe('whitespace')
  })
})
