/* eslint-disable jest/no-large-snapshots */
import { defaultConfig } from '../defaults'
import * as fns from './executeCommand'

describe('executeDryRun', () => {
  it('should console log git message', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(jest.fn())

    fns.executeDryRun('feat(cli): 🎸 initial release')

    expect(spy).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "[34m❯ Message...[39m",
          ],
          Array [
            "
      feat(cli): 🎸 initial release
      ",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `)
  })
})
const answers = {
  body: 'this an amazing feature, lots of details',
  breaking: 'breaks everything',
  issues: '#123',
  scope: '*',
  subject: 'a cool new feature',
  type: 'feat',
}

describe('executeGitMessage', () => {
  it('should call executeCommand', () => {
    const spy = jest.spyOn(fns, 'executeCommand').mockImplementation(jest.fn())

    fns.executeGitMessage({ config: defaultConfig, answers }, {})
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should call executeDryRun', () => {
    const spy = jest.spyOn(fns, 'executeDryRun').mockImplementation(jest.fn())

    fns.executeGitMessage({ config: defaultConfig, answers }, { dryRun: true })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
