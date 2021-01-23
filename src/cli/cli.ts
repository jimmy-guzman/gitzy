import { program } from 'commander'
import { cyan, red } from 'ansi-colors'
import Enquirer from 'enquirer'

import { getUserConfig } from '../config'
import { defaultConfig, defaultAnswers } from '../defaults'
import { Answers, Flags } from '../interfaces'
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
} from '../utils'
import { options } from './options'

const enquirerOptions = {
  autofill: true,
  cancel: () => null,
  styles: { submitted: cyan, danger: red },
}

export const cli = async (): Promise<void> => {
  const state = { config: defaultConfig, answers: defaultAnswers }

  const init = async ({ passthrough, commitlint, dryRun }: Flags) => {
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
      writeErr: str => process.stdout.write(str.replace('error: ', '')),
      outputError: (error, write) => write(`\n${danger(error)}\n`),
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
    .action(async () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const flags: Flags = program.opts()

      if (flags.dryRun) {
        log(info('running in dry mode...'))
      }

      try {
        await init(flags)
        const answers = await promptQuestions(flags as Answers)

        state.answers = { ...state.answers, ...answers }
      } catch (error) {
        log(`\n${danger(error.message)}\n`)
        process.exit(1)
      }

      executeGitMessage(state, flags)
    })

  await program.parseAsync(process.argv)
}
