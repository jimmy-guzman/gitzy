import { promptsLang } from './lang'

describe('lang', () => {
  describe('promptsLang', () => {
    it('should create prompts lang', () => {
      expect(promptsLang).toMatchSnapshot()
    })
  })
})
