import { blue, red } from 'ansi-colors'

export const info = (message: string): string => blue(`❯ ${message}`)

export const danger = (message: string): string => red(`❯ ${message}`)

// eslint-disable-next-line no-console
export const log = (message: string): void => console.log(message)
