import path from 'path'

interface Pkg {
  version: string
  engines: {
    node: string
  }
}

// eslint-disable-next-line import/no-unresolved, @typescript-eslint/no-var-requires
export const gitzyPkg: Pkg = require(path.join(__dirname, '..', 'package.json'))
