import { cyan, red } from 'ansi-colors'
import { program } from 'commander'
import Enquirer from 'enquirer'

import type { Answers, Flags } from '../interfaces'
import type { CommanderError } from 'commander'

import { options } from './options'
import { getUserConfig } from '../config'
import { defaultConfig, defaultAnswers } from '../defaults'
import { lang } from '../lang'
import { createPrompts } from '../prompts'
import {
  shouldDoGitChecks,
  log,
  checkIfStaged,
  executeGitMessage,
  danger,
  info,
  checkIfGitRepo,
  gitzyPkg,
  GitzyStore,
  hint,
} from '../utils'

const enquirerOptions = {
  autofill: true,
  cancel: (): null => null,
  styles: { submitted: cyan, danger: red },
}

// eslint-disable-next-line max-lines-per-function
export const cli = async (): Promise<void> => {
  const state = { config: defaultConfig, answers: defaultAnswers }
  const store = new GitzyStore<Answers>()

  const init = async ({
    passthrough,
    commitlint,
    dryRun,
  }: Flags): Promise<void> => {
    const loadedUserConfig = await getUserConfig(commitlint)

    if (loadedUserConfig) {
      state.config = { ...state.config, ...loadedUserConfig }
    }

    if (shouldDoGitChecks(passthrough) && !dryRun) {
      await checkIfGitRepo()
      await checkIfStaged()
    }
  }

  const promptQuestions = async (flags: Answers): Promise<Answers> => {
    const enquirer = new Enquirer(enquirerOptions, flags)
    const prompts = createPrompts(state, flags)

    return enquirer.prompt(prompts)
  }

  program
    .configureOutput({
      writeErr: (str) => process.stdout.write(str.replace('error: ', '')),
      outputError: (error, write) => {
        write(`\n${danger(error)}\n`)
      },
    })
    .version(gitzyPkg().version, '-v, --version')
    .description(lang.description)
    .option('-d, --body <body>', lang.flags.body)
    .option('-b, --breaking <breaking>', lang.flags.breaking)
    .option('-D, --dry-run', lang.flags.dryRun)
    .option('-i, --issues <body>', lang.flags.issues)
    .option('-p, --passthrough <flags...>', lang.flags.passthrough)
    .option('-s, --scope <scope>', lang.flags.scope)
    .option('-m, --subject <message>', lang.flags.subject)
    .option('-t, --type <type>', lang.flags.type)
    .option('-l, --commitlint', lang.flags.commitlint)
    .option('-r, --retry', lang.flags.retry)
    .option('--no-emoji', lang.flags.noEmoji)
    .addOption(options.skip)
    .addHelpText(
      'after',
      `
${'Examples'}:
      ${lang.examples}
    `
    )
    .name('gitzy')
    // eslint-disable-next-line max-statements
    .action(async () => {
      const flags: Flags = program.opts()

      if (flags.dryRun) {
        log(info('running in dry mode...'))
      }

      try {
        await init(flags)
        const previousAnswers = flags.retry ? store.load() : {}

        if (flags.retry && !Object.keys(previousAnswers).length) {
          log(hint(`there is no previous gitzy commit to retry...`))
        }

        const answers = await promptQuestions({
          ...(flags as Answers),
          ...previousAnswers,
        })

        store.save(answers)

        state.answers = { ...state.answers, ...answers }
      } catch (error: unknown) {
        log(`\n${danger((error as CommanderError).message)}\n`)

        process.exit(1)
      }

      executeGitMessage(state, flags)
    })

  await program.parseAsync(process.argv)
}
