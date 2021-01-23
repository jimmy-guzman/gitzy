import { options } from './options'

describe('options', () => {
  it('should create skip option', () => {
    expect(options.skip).toMatchObject({
      argChoices: ['type', 'scope', 'subject', 'body', 'breaking', 'issues'],
      variadic: true,
      short: '-S',
      long: '--skip',
    })
  })
})
