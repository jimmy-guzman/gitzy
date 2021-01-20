import {
  Answers,
  CreatedPrompt,
  EnquirerPrompt,
  Flags,
  GitzyConfig,
  GitzyPrompts,
} from '../interfaces'
import { body } from './body'
import { breaking } from './breaking'
import { issues } from './issues'
import { scope } from './scope'
import { subject } from './subject'
import { type } from './type'

const prompts: Record<string, CreatedPrompt> = {
  body,
  breaking,
  issues,
  scope,
  subject,
  type,
}

const notEmpty = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}

export const createPrompts = (
  { config, answers }: { config: GitzyConfig; answers: Answers },
  questionSet: GitzyPrompts[],
  flags: Flags
): EnquirerPrompt[] => {
  return config.questions
    .filter(question => questionSet.includes(question))
    .map(name => prompts[name](config, answers, flags))
    .filter(notEmpty)
}
