import { cli } from './cli'
import { abortCli } from './utils'

if (parseInt(process.versions.node, 10) < 10) {
  abortCli(
    new Error(
      `node version ${process.versions.node} is not supported, please use ${
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../package.json').engines.node
      }`
    )
  )
}

cli()
