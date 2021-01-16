import { blue, red } from 'ansi-colors'

export const formatInfo = (message: string): string => blue(`❯ ${message}`)

export const formatError = (message: string): string => red(`\n❯ ${message}`)

export const abortCli = (error: Error): void => {
  // eslint-disable-next-line no-console
  console.log(`${formatError(error.message)}\n`)
  process.exit(1)
}

export const logInfo = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(formatInfo(message))
}
