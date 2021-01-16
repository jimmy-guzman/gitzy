import { Command } from '@oclif/command'
import prompts from 'prompts'
import kleur from 'kleur'

import { defaultAnswers, defaultConfig } from './defaults'
import { getUserConfig } from './config'
import { checkIfStaged, createPrompts, executeGitMessage } from './utils'
import { commitFlags } from './flags'
import { messages } from './messages'
import { Answers, GitzyPrompts } from './interfaces'

const shouldCheckIfStaged = (array: string[] = []): boolean => {
  return !['--add', '-a', '--amend'].some(flag => array.includes(flag))
}

class GitzyCli extends Command {
  static description = messages.description
  static examples = messages.examples
  static flags = commitFlags
  static aliases = ['', 'c']

  state = { config: defaultConfig, answers: defaultAnswers }

  start = async (): Promise<void> => {
    const { flags: cliFlags } = this.parse(GitzyCli)
    const loadedUserConfig = await getUserConfig(this.state.config)

    if (loadedUserConfig) {
      this.state.config = loadedUserConfig
    }

    if (shouldCheckIfStaged(cliFlags.passThrough)) {
      await checkIfStaged()
    }
  }

  customPrompt = async (
    customPrompts: GitzyPrompts[],
    userAnswers?: Answers
  ): Promise<Answers> => {
    return prompts(
      createPrompts(
        {
          ...this.state,
          answers: { ...this.state.answers, ...userAnswers },
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

  promptQuestions = async (): Promise<void> => {
    const { flags: cliFlags } = this.parse(GitzyCli)
    const [first, second, ...rest] = defaultConfig.questions

    prompts.override(cliFlags)

    const firstAnswers = await this.customPrompt([first, second])
    const secondAnswers = await this.customPrompt(rest, firstAnswers)

    this.state.answers = {
      ...this.state.answers,
      ...firstAnswers,
      ...secondAnswers,
    }
  }

  async run(): Promise<void> {
    const { flags: cliFlags } = this.parse(GitzyCli)

    await this.start()
    await this.promptQuestions()

    executeGitMessage(this.state, cliFlags.passThrough)
  }

  async catch(error: Error): Promise<void> {
    await this.log(kleur.red(String(error)))
  }
}

export = GitzyCli
