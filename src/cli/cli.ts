import { program } from 'commander'
import { cyan, red } from 'ansi-colors'
import Enquirer from 'enquirer'

import { getUserConfig } from '../config'
import { defaultConfig, defaultAnswers } from '../defaults'
import { Answers, Flags } from '../interfaces'
import { lang } from '../lang'
import { createPrompts } from '../prompts'
import {
  shouldCheckIfStaged,
  log,
  checkIfStaged,
  executeGitMessage,
  danger,
  info,
} from '../utils'

const enquirerOptions = {
  autofill: true,
  cancel: () => null,
  styles: { submitted: cyan, danger: red },
}

export const cli = async (): Promise<void> => {
  const state = { config: defaultConfig, answers: defaultAnswers }

  const init = async ({ passthrough, commitlint }: Flags) => {
    const loadedUserConfig = await getUserConfig(commitlint)

    if (loadedUserConfig) {
      state.config = { ...state.config, ...loadedUserConfig }
    }

    if (shouldCheckIfStaged(passthrough)) {
      await checkIfStaged()
    }
  }

  const promptQuestions = async (rest: Answers): Promise<Answers> => {
    const enquirer = new Enquirer(enquirerOptions, rest)
    const prompts = createPrompts(state, defaultConfig.questions)

    return enquirer.prompt(prompts)
  }

  program
    .configureOutput({
      writeErr: str => process.stdout.write(str.replace('error: ', '')),
      outputError: (error, write) => write(`\n${danger(error)}\n`),
    })
    // eslint-disable-next-line import/no-unresolved, @typescript-eslint/no-var-requires
    .version(require('../package.json').version, '-v, --version')
    .description(lang.description)
    .option('-d, --body <body>', lang.flags.body)
    .option('-b, --breaking <breaking>', lang.flags.breaking)
    .option('-D, --dry-run', lang.flags.dryRun)
    .option('-i, --issues <body>', lang.flags.issues)
    .option('-p, --passthrough <...flags>', lang.flags.passthrough)
    .option('-s, --scope <scope>', lang.flags.scope)
    .option('-m, --message <message>', lang.flags.subject)
    .option('-t, --type <type>', lang.flags.type)
    .option('-l, --commitlint', lang.flags.commitlint)
    .addHelpText(
      'after',
      `
${'Examples'}:
      ${lang.examples}
    `
    )
    .name('gitzy')
    .action(async () => {
      const { dryRun, ...args } = program.opts()

      if (dryRun) {
        log(info('running in dry mode...'))
      }

      try {
        await init(args)
        const answers = await promptQuestions(args as Answers)

        state.answers = { ...state.answers, ...answers }
      } catch (error) {
        log(`\n${danger(error.message)}\n`)
        process.exit(1)
      }

      executeGitMessage(state, { args: args.passThrough, dryRun })
    })

  await program.parseAsync(process.argv)
}
