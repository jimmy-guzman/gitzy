import { blue, red } from 'kleur'

export const formatInfo = (message: string): string =>
  `${blue('info')} ${message}`

export const formatError = (message: string): string =>
  `${red('error')} ${message}`

export const abortCli = (error: Error): void => {
  // eslint-disable-next-line no-console
  console.log(`${formatError(error.message)}\n`)
  process.exit(1)
}
