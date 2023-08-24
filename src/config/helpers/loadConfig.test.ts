import { access, unlinkSync, writeFile } from 'node:fs'

import { loadConfig } from './loadConfig'

describe('searchPlaces', () => {
  afterEach(() => {
    access('./.arc.json', (error) => {
      if (!error) {
        unlinkSync('.arc.json')
      }
    })
  })

  it('should return null if no config is found', async () => {
    const config = await loadConfig('a')

    expect(config).toBeNull()
  })

  it('should return config for json files', async () => {
    writeFile('.arc.json', JSON.stringify({ disableEmoji: true }), (error) => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (error) throw error
    })

    const config = await loadConfig('a')

    expect(config).toStrictEqual({
      config: { disableEmoji: true },
      filepath: `${process.cwd()}/.arc.json`,
    })
  })
})
