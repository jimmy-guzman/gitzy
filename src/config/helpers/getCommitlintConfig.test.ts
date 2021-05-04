import {
  getCommitlintOverrides,
  getCommitlintConfig,
} from './getCommitlintConfig'
import * as utils from './loadConfig'

describe('getCommitlintConfig', () => {
  describe('getCommitlintOverrides', () => {
    it('should return all overrides', () => {
      expect(
        getCommitlintOverrides({
          rules: {
            'scope-enum': [2, 'always', ['1', '2']],
            'type-enum': [2, 'always', ['1', '2']],
            'header-max-length': [2, 'always', 10],
            'header-min-length': [2, 'always', 1],
          },
        })
      ).toMatchObject({
        scopes: ['1', '2'],
        types: ['1', '2'],
        headerMaxLength: 10,
        headerMinLength: 1,
      })
    })
    it('should return null when there is no commitlint config', async () => {
      jest.spyOn(utils, 'loadConfig').mockReturnValueOnce(Promise.resolve(null))
      expect(await getCommitlintConfig()).toBeNull()
    })
    it('should return null when the commitlint config is not valid', async () => {
      jest
        .spyOn(utils, 'loadConfig')
        .mockReturnValueOnce(
          Promise.resolve({ config: 'not valid', filepath: '' })
        )
      expect(await getCommitlintConfig()).toBeNull()
    })
    it('should return commitlint config', async () => {
      jest.spyOn(utils, 'loadConfig').mockReturnValueOnce(
        Promise.resolve({
          config: {
            rules: {
              'scope-enum': ['', '', ['feat']],
            },
          },
          filepath: '',
        })
      )
      expect(await getCommitlintConfig()).toStrictEqual({ scopes: ['feat'] })
    })
  })
})
