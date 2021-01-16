import { leadingLabel, subject } from './subject'
import { defaultConfig } from '../defaults'

const setupSubject = (config = {}) => {
  return subject({ ...defaultConfig, ...config })
}

const answers = {
  body: 'this an amazing feature, lots of details',
  breaking: 'breaks everything',
  issues: '#123',
  scope: '*',
  subject: 'a cool new feature',
  type: 'feat',
}

describe('subject', () => {
  it('should create default subject', () => {
    const subjectQuestion = setupSubject()

    expect(subjectQuestion).toStrictEqual(
      expect.objectContaining({
        message: expect.any(Function),
        name: 'subject',
        type: 'input',
        validate: expect.any(Function),
      })
    )
  })
  describe('leadingLabel', () => {
    it("should create subject's leading label with scope", () => {
      expect(leadingLabel(answers)).toBe('feat(*):')
    })
    it('should create subject leading label with no scope', () => {
      expect(leadingLabel({ ...answers, scope: '' })).toBe('feat:')
    })
  })
  describe('validate', () => {
    it.todo('should return min error message when the length is not valid')
    it.todo('should return true when length is valid')
  })
})
