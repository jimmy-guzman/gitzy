import Enquirer from 'enquirer'
import { mocked } from 'ts-jest/utils'

import * as config from '../config'
import { defaultConfig, defaultAnswers } from '../defaults'
import * as utils from '../utils'
import { cli } from './cli'

jest.mock('enquirer')

describe('cli', () => {
  beforeAll(() => {
    mocked(Enquirer).mockImplementation(() => {
      return {
        prompt: jest.fn(),
      } as unknown as Enquirer
    })
  })
  it('should run with defaults', async () => {
    process.argv = []
    jest
      .spyOn(utils, 'gitzyPkg')
      .mockReturnValueOnce({ engines: { node: '14' }, version: '1.0.0' })
    const executeGitMessageSpy = jest
      .spyOn(utils, 'executeGitMessage')
      .mockImplementationOnce(jest.fn())
    const checkIfGitSpy = jest
      .spyOn(utils, 'checkIfGitRepo')
      .mockResolvedValueOnce('yes')
    const checkIfStagedSpy = jest
      .spyOn(utils, 'checkIfStaged')
      .mockResolvedValueOnce('yes')

    const getUserConfigSpy = jest
      .spyOn(config, 'getUserConfig')
      .mockResolvedValueOnce(defaultConfig)

    await cli()

    expect(Enquirer).toHaveBeenNthCalledWith(
      1,
      {
        autofill: true,
        cancel: expect.any(Function),
        styles: {
          submitted: expect.any(Function),
          danger: expect.any(Function),
        },
      },
      { emoji: true }
    )
    expect(checkIfGitSpy).toHaveBeenCalledTimes(1)
    expect(checkIfStagedSpy).toHaveBeenCalledTimes(1)
    expect(getUserConfigSpy).toHaveBeenNthCalledWith(1, undefined)
    expect(executeGitMessageSpy).toHaveBeenNthCalledWith(
      1,
      {
        config: defaultConfig,
        answers: defaultAnswers,
      },
      { emoji: true }
    )
  })
})
