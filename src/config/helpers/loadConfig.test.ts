import { getSearchPlaces } from './loadConfig'

describe('searchPlaces', () => {
  it('should return all search places', () => {
    // eslint-disable-next-line jest/no-large-snapshots
    expect(getSearchPlaces('gitzy')).toMatchInlineSnapshot(`
      Array [
        "package.json",
        ".gitzyrc",
        ".gitzyrc.json",
        ".gitzyrc.yaml",
        ".gitzyrc.yml",
        ".gitzyrc.js",
        ".gitzyrc.cjs",
        "gitzy.config.js",
        "gitzy.config.cjs",
        ".config/.gitzyrc",
        ".config/.gitzyrc.json",
        ".config/.gitzyrc.yaml",
        ".config/.gitzyrc.yml",
        ".config/.gitzyrc.js",
        ".config/.gitzyrc.cjs",
        ".config/gitzy.config.js",
        ".config/gitzy.config.cjs",
      ]
    `)
  })
})
