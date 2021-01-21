import { cleanObject } from './cleanObject'

describe('cleanObject', () => {
  it('should remove null values', () => {
    expect(cleanObject({ b: null, o: 'y' })).toStrictEqual({ o: 'y' })
  })
  it('should remove undefined values', () => {
    expect(cleanObject({ b: undefined, o: 'y' })).toStrictEqual({ o: 'y' })
  })
})
