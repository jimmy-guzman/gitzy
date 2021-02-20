/* eslint-disable jest/no-large-snapshots */
import { defaultConfig } from '../defaults'
import * as fns from './executeCommand'

describe('executeDryRun', () => {
  it('should console log git message', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(jest.fn())

    fns.executeDryRun('feat(cli): ✨ initial release')

    expect(spy).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "[34m❯ Message...[39m",
          ],
          Array [
            "
      feat(cli): ✨ initial release
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

describe('executeGitMessage', () => {
  const answers = {
    body: 'this an amazing feature, lots of details',
    breaking: 'breaks everything',
    issues: '#123',
    scope: '*',
    subject: 'a cool new feature',
    type: 'feat',
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call executeCommand by default', () => {
    const executeCommandSpy = jest
      .spyOn(fns, 'executeCommand')
      .mockImplementation(jest.fn())

    fns.executeGitMessage({ config: defaultConfig, answers }, {})

    expect(executeCommandSpy).toHaveBeenCalledTimes(1)
  })

  it('should call executeDryRun and not executeCommand when in dry ryn mode', () => {
    const executeCommandSpy = jest
      .spyOn(fns, 'executeCommand')
      .mockImplementation(jest.fn())
    const executeDryRunSpy = jest
      .spyOn(fns, 'executeDryRun')
      .mockImplementation(jest.fn())

    fns.executeGitMessage({ config: defaultConfig, answers }, { dryRun: true })
    expect(executeDryRunSpy).toHaveBeenCalledTimes(1)
    expect(executeCommandSpy).not.toHaveBeenCalled()
  })
})
