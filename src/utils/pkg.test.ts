import { gitzyPkg } from './pkg'

jest.mock(
  '../package.json',
  () => ({
    version: '1.0.0',
    engines: {
      node: '>=10.0.0',
    },
  }),
  { virtual: true }
)

describe('logging', () => {
  it('info', () => {
    expect(gitzyPkg).toStrictEqual({
      version: '1.0.0',
      engines: {
        node: '>=10.0.0',
      },
    })
  })
})
