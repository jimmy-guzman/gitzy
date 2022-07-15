import fs from 'fs'
import path from 'path'

import type { Stats } from 'fs'

import * as utils from './utils'

describe('utils', () => {
  it('should return gitzy store path', () => {
    expect(utils.gitzyStorePath()).toMatch(/\/gitzy\/+[\w]+-store\.json/)
  })
  describe('tryUnlink', () => {
    it('should throw when there is non ENOENT error', () => {
      jest.spyOn(fs, 'unlinkSync').mockImplementationOnce(() => {
        throw new Error('some new error')
      })

      expect(() => {
        utils.tryUnlink('path')
      }).toThrow('some new error')
    })
    it('should do nothing when there is a ENOENT error', () => {
      class CustomError extends Error {
        code = 'ENOENT'
      }
      jest.spyOn(fs, 'unlinkSync').mockImplementationOnce(() => {
        throw new CustomError('ENOENT')
      })

      expect(() => {
        utils.tryUnlink('path')
      }).not.toThrow()
    })
  })
  describe('directoryExists', () => {
    it('should return false when there is no stat', () => {
      jest.spyOn(utils, 'tryStat').mockReturnValueOnce(null)
      expect(utils.directoryExists('path')).toBe(false)
    })
    it('should return false when there is a stat', () => {
      jest
        .spyOn(utils, 'tryStat')
        .mockReturnValueOnce({ isDirectory: jest.fn() } as unknown as Stats)
      expect(() => utils.directoryExists('path')).toThrow(
        'Path exists and is not a directory: "path"'
      )
    })
  })
  describe('handleError', () => {
    it('should return error when there is null byes', () => {
      expect(() => {
        utils.handleError('path', {
          message: 'null bytes',
          code: 'CODE',
          name: 'name',
        })
      }).toThrow('')
    })
    it('should return error when there when error is not ignored', () => {
      expect(() => {
        utils.handleError('path', {
          message: 'message',
          code: 'CODE',
          name: 'name',
        })
      }).toThrow('')
    })
    it('should not throw when error is ignored', () => {
      jest.spyOn(path, 'dirname').mockReturnValueOnce('path1')
      expect(() => {
        utils.handleError('path2', {
          message: 'MESSAGE',
          code: 'EEXIST',
          name: 'name',
        })
      }).not.toThrow()
    })
  })

  describe('tryState', () => {
    it('should return null when fs.statSync throws', () => {
      jest.spyOn(fs, 'statSync').mockImplementationOnce(() => {
        throw new Error('')
      })

      expect(utils.tryStat('filePath')).toBeNull()
    })
  })

  describe('mkdir', () => {
    const DIR_NAME = 'dirname'

    it('should do nothing when directory exists', () => {
      const mkdirSyncSpy = jest
        .spyOn(fs, 'mkdirSync')
        .mockImplementationOnce(jest.fn())
      const handleErrorSpy = jest.spyOn(utils, 'handleError')

      jest.spyOn(utils, 'directoryExists').mockReturnValueOnce(true)

      utils.mkdir(DIR_NAME)
      expect(mkdirSyncSpy).not.toHaveBeenCalled()
      expect(handleErrorSpy).not.toHaveBeenCalled()
    })
    it('should do throw when mkdirSync fails', () => {
      const mkdirSyncSpy = jest
        .spyOn(fs, 'mkdirSync')
        .mockImplementationOnce(() => {
          throw new Error('')
        })
      const handleErrorSpy = jest
        .spyOn(utils, 'handleError')
        .mockImplementationOnce(jest.fn())

      jest.spyOn(utils, 'directoryExists').mockReturnValueOnce(false)

      utils.mkdir(DIR_NAME)

      expect(mkdirSyncSpy).toHaveBeenNthCalledWith(1, DIR_NAME, {
        recursive: true,
      })
      expect(handleErrorSpy).toHaveBeenNthCalledWith(1, DIR_NAME, new Error(''))
    })
    it('should call mkdirSync when directory does not exist', () => {
      const mkdirSyncSpy = jest
        .spyOn(fs, 'mkdirSync')
        .mockImplementationOnce(jest.fn())
      const handleErrorSpy = jest.spyOn(utils, 'handleError')

      jest.spyOn(utils, 'directoryExists').mockReturnValueOnce(false)

      utils.mkdir(DIR_NAME)

      expect(mkdirSyncSpy).toHaveBeenNthCalledWith(1, DIR_NAME, {
        recursive: true,
      })
      expect(handleErrorSpy).not.toHaveBeenCalled()
    })
  })
})
