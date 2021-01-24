import { getCommitlintOverrides } from './getCommitlintConfig'

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
  it('should only return commitlint rules overrides', () => {
    expect(getCommitlintOverrides({})).toMatchObject({})
  })
})
