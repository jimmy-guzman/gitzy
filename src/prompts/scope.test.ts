import { defaultConfig } from '../defaults'
import { CreatedPromptOptions, EnquirerPrompt } from '../interfaces'
import { scope } from './scope'

const setupScope = (config = {}): Required<EnquirerPrompt> => {
  return scope({
    config: { ...defaultConfig, ...config },
  } as CreatedPromptOptions) as Required<EnquirerPrompt>
}

describe('scope', () => {
  it('should return null if no scope', () => {
    expect(setupScope()).toBeNull()
  })

  it('should suggest needle in the haystack', async () => {
    const { suggest } = setupScope({ scopes: ['build'] })

    const needle = await suggest('ui')

    expect(needle).toStrictEqual([
      { indent: ' ', title: 'build', value: 'build' },
    ])
  })

  it('should return scope prompt if there is a scope', () => {
    expect(setupScope({ scopes: ['build'] })).toMatchObject({
      choices: [
        {
          indent: ' ',
          title: 'build',
          value: 'build',
        },
      ],
      hint: '[2m...type or use arrow keys[22m',
      limit: 10,
      message: 'Choose the scope',
      name: 'scope',
      suggest: expect.any(Function),
      type: 'autocomplete',
    })
  })
})
