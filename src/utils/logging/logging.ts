import { blue, red, yellow } from 'ansi-colors'

export const info = (message: string): string => blue(`❯ ${message}`)
export const hint = (message: string): string => yellow(`❯ ${message}`)
export const danger = (message: string): string => red(`❯ ${message}`)

export const log = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message)
}
