import { danger, info, log } from './logging'

const message = 'logging...'

describe('logging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('info', () => {
    expect(info(message)).toMatchInlineSnapshot(`"[34m❯ logging...[39m"`)
  })
  it('danger', () => {
    expect(danger(message)).toMatchInlineSnapshot(`"[31m❯ logging...[39m"`)
  })
  it('log', () => {
    const spy = jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())

    log(message)

    expect(spy).toHaveBeenNthCalledWith(1, message)
  })
})
