import { Kleur } from 'kleur'
import { PromptObject } from 'prompts'

export interface CustomPromptObject extends PromptObject {
  onRender(kleur: Kleur): void
}
