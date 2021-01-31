import * as child_process from 'child_process'

import { checkIfGitRepo, checkIfStaged, shouldDoGitChecks } from './git-utils'

jest.mock('child_process')

const childProcessMock = (child_process.exec as unknown) as jest.Mock

const mockExec = (value: string | null = null): void => {
  childProcessMock.mockImplementation(
    (
      _command: unknown,
      callback: (arg0: string | null, arg1: { stdout: string }) => unknown
    ) => callback(value, { stdout: 'ok' })
  )
}

describe('shouldDoGitChecks', () => {
  const flags = ['--add', '-a', '--amend']

  flags.forEach((flag) => {
    it(`should skip git check if '${flag}'`, () => {
      expect(shouldDoGitChecks([flag])).toBeFalsy()
    })
  })

  it('should perform check if no flags', () => {
    expect(shouldDoGitChecks()).toBeTruthy()
  })
})

describe('checkIfStaged', () => {
  it('should throw', async () => {
    mockExec()

    await expect(checkIfStaged()).rejects.toThrow('No files staged')
  })
  it('should rethrow', async () => {
    mockExec('error')

    await expect(checkIfStaged()).resolves.toStrictEqual('')
  })
})

describe('checkIfGitRepo', () => {
  it('should throw', async () => {
    mockExec('error')

    await expect(checkIfGitRepo()).rejects.toThrow('Not a git repository')
  })
  it('should resolve', async () => {
    mockExec()

    await expect(checkIfGitRepo()).resolves.toStrictEqual('')
  })
})
