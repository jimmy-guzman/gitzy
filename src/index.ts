import { cli } from './cli'
import { gitzyPkg, log, danger, info } from './utils'

const version = parseInt(process.versions.node, 10)

if (version < 10) {
  log(`\n${danger(`node version ${version} is not supported`)}`)
  log(`${info(`please use ${gitzyPkg().engines.node}`)}\n`)
  process.exit(1)
}

cli()
