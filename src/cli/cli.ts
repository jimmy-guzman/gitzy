import { program } from 'commander'
import { grey } from 'kleur'
import prompts from 'prompts'

import { getUserConfig } from '../config'
import { defaultConfig, defaultAnswers } from '../defaults'
import { GitzyPrompts, Answers } from '../interfaces'
import { messages } from '../messages'
import {
  shouldCheckIfStaged,
  abortCli,
  checkIfStaged,
  createPrompts,
  executeGitMessage,
} from '../utils'

export const cli = async (): Promise<void> => {
  program
    .description(messages.description)
    .option('-d, --body <body>', messages.flags.body)
    .option('-b, --breaking <breaking>', messages.flags.breaking)
    .option('-D, --dry-run', messages.flags.dryRun)
    .option('-i, --issues <body>', messages.flags.issues)
    .option('-p, --passThrough <...flags>', messages.flags.passThrough)
    .option('-s, --scope <scope>', messages.flags.scope)
    .option('-m, --message <message>', messages.flags.subject)
    .option('-t, --type <type>', messages.flags.type)
    .addHelpText(
      'after',
      `
${'Examples'}:
      ${messages.examples}
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
