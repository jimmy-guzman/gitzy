import { program } from 'commander'
import { grey } from 'kleur'
import prompts from 'prompts'

import { getUserConfig } from '../config'
import { defaultConfig, defaultAnswers } from '../defaults'
import { GitzyPrompts, Answers } from '../interfaces'
import { lang } from '../lang'
import { createPrompts } from '../prompts'
import {
  shouldCheckIfStaged,
  abortCli,
  checkIfStaged,
  executeGitMessage,
} from '../utils'

export const cli = async (): Promise<void> => {
  program
    // eslint-disable-next-line import/no-unresolved, @typescript-eslint/no-var-requires
    .version(require('../package.json').version, '-v, --version')
    .description(lang.description)
    .option('-d, --body <body>', lang.flags.body)
    .option('-b, --breaking <breaking>', lang.flags.breaking)
    .option('-D, --dry-run', lang.flags.dryRun)
    .option('-i, --issues <body>', lang.flags.issues)
    .option('-p, --passThrough <...flags>', lang.flags.passThrough)
    .option('-s, --scope <scope>', lang.flags.scope)
    .option('-m, --message <message>', lang.flags.subject)
    .option('-t, --type <type>', lang.flags.type)
    .addHelpText(
      'after',
      `
${'Examples'}:
      ${lang.examples}
    `
    )
    .name('gitzy')

  const state = { config: defaultConfig, answers: defaultAnswers }

  const init = async () => {
    const options = program.opts()
    const loadedUserConfig = await getUserConfig(state.config)

    if (loadedUserConfig) {
      state.config = loadedUserConfig
    }

    if (shouldCheckIfStaged(options.passThrough)) {
      await checkIfStaged()
    }
  }

  const customPrompt = async (
    customPrompts: GitzyPrompts[],
    userAnswers?: Answers
  ): Promise<Answers> => {
    return prompts(
      createPrompts(
        {
          ...state,
          answers: { ...state.answers, ...userAnswers },
        },
        customPrompts
      ),
      {
        onCancel: () => {
          throw new Error('gitzy was aborted!')
        },
      }
    ) as Promise<Answers>
  }

  const promptQuestions = async (): Promise<void> => {
    const options = program.opts()
    const [first, second, ...rest] = defaultConfig.questions

    prompts.override(options)

    const firstAnswers = await customPrompt([first, second])
    const secondAnswers = await customPrompt(rest, firstAnswers)

    state.answers = {
      ...state.answers,
      ...firstAnswers,
      ...secondAnswers,
    }
  }

  program.action(async () => {
    const options = program.opts()

    if (options.dryRun) {
      // eslint-disable-next-line no-console
      console.log(grey('running in dry mode...'))
    }

    try {
      await init()
      await promptQuestions()
    } catch (error) {
      abortCli(error)
    }

    executeGitMessage(state, {
      args: options.passThrough,
      dryRun: options.dryRun,
    })
  })
  await program.parseAsync(process.argv)
}
