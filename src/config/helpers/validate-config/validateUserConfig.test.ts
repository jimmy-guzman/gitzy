import { defaultConfig } from '../../../defaults'
import { validateConfig, validateUserConfig } from './validateUserConfig'

describe('validateConfig', () => {
  it('should return unknown or additional properties detected', () => {
    expect(validateConfig({ yellow: 'banana' })).toBe(
      'unknown or additional properties detected'
    )
  })
  it('should return invalid configuration', () => {
    expect(validateConfig(1)).toBe('invalid configuration')
  })
  it('should return true if all validations pass', () => {
    expect(validateConfig(defaultConfig)).toBe(true)
  })
})

describe('validateUserConfig', () => {
  it('should throw if config is invalid', async () => {
    await expect(validateUserConfig({ yellow: 'banana' })).rejects.toThrow()
  })
  it('should return true if config is valid', async () => {
    await expect(validateUserConfig({ disableEmoji: true })).resolves.toBe(true)
  })
})
