import {
  hasAdditionalProperties,
  hasProperty,
  isArrayOfStrings,
  isBoolean,
  isNumber,
  isObject,
  isString,
  isValidDetails,
  isValidIssues,
} from './validators'

describe('isString', () => {
  it('should return false if it is not a string', () => {
    expect(isString(1)).toBe(false)
  })
})

describe('isBoolean', () => {
  it('should return false if it is not a boolean', () => {
    expect(isBoolean(1)).toBe(false)
  })
})

describe('isNumber', () => {
  it('should return false if it is not a number', () => {
    expect(isNumber('banana')).toBe(false)
  })
})

describe('isObject', () => {
  it('should return false if it is not an object', () => {
    expect(isObject(1)).toBe(false)
  })
})

describe('isArrayOfStrings', () => {
  it('should return false if it is not an array', () => {
    expect(isArrayOfStrings(1)).toBe(false)
  })
  it('should return false if it is not an array of strings', () => {
    expect(isArrayOfStrings([1])).toBe(false)
  })
})

describe('isValidIssues', () => {
  it('should return true if it is not a valid issue', () => {
    expect(isValidIssues('banana')).toBe(false)
  })
})

describe('hasProperty', () => {
  it('should return false if it is not a string', () => {
    expect(hasProperty({ yellow: 'banana' }, 'orange')).toBe(false)
  })
})

describe('isValidDetails', () => {
  it('should return false if it does not contain "description"', () => {
    expect(
      isValidDetails({
        chore: { banana: 'yellow', emoji: 'orange' },
      })
    ).toBe(false)
  })
  it('should return false if it does not contain "emoji"', () => {
    expect(
      isValidDetails({
        chore: { description: 'yellow', banana: 'orange' },
      })
    ).toBe(false)
  })
  it('should return every with detail values as strings', () => {
    expect(
      isValidDetails({
        chore: { description: 'yellow', emoji: 1 },
      })
    ).toBe(false)
  })
})

describe('hasAdditionalProperties', () => {
  it('should return true if object has additional properties', () => {
    expect(hasAdditionalProperties({ yellow: 'banana' })).toBe(true)
  })
})
