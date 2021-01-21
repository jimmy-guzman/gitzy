import { fuzzySearch } from './fuzzy-search'

describe('fuzzy-search', () => {
  it('should return the needle in the haystack', async () => {
    const needle = await fuzzySearch(
      [{ name: 'joe' }, { name: 'jane' }],
      'ne',
      'name'
    )

    expect(needle).toStrictEqual([{ name: 'jane' }])
  })
  it('should return the haystack', async () => {
    const needle = await fuzzySearch(
      [{ name: 'joe' }, { name: 'jane' }],
      '',
      'name'
    )

    expect(needle).toStrictEqual([{ name: 'joe' }, { name: 'jane' }])
  })
})
