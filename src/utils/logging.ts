import { bgBlue, bgRed, blue, red } from 'kleur'

export const formatInfo = (message: string): string =>
  `${bgBlue().black(' info ')} ${blue(message)}`

export const formatError = (message: string): string =>
  `${bgRed().black(' error ')} ${red(message)}`

export const abortCli = (error: Error): void => {
  // eslint-disable-next-line no-console
  console.log(`${formatError(error.message)}\n`)
  process.exit(1)
}
