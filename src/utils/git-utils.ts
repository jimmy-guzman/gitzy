import { exec } from 'child_process'

import { hint } from './logging'

/**
 * Determines wether or not files are staged.
 */
export const checkIfStaged = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('git --no-pager diff --cached --quiet --exit-code', error => {
      if (error) {
        resolve('')
      }
      reject(
        new Error(
          `No files staged \n${hint(
            'You can use "gitzy -p -a" to replicate git -am'
          )}`
        )
      )
    })
  })
}

export const checkIfGitRepo = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --is-inside-work-tree', error => {
      if (error) {
        reject(
          new Error(
            `Not a git repository \n${hint('You can try running "git init"')}`
          )
        )
      }

      resolve('')
    })
  })
}

export const shouldDoGitChecks = (array: string[] = []): boolean => {
  return !['--add', '-a', '--amend'].some(flag => array.includes(flag))
}
