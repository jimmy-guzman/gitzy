import { red } from 'kleur'

import { CustomPromptObject } from './interfaces'
import { highlightCursor } from './utils'

export const breaking = (): CustomPromptObject => {
  return {
    message: `List any breaking changes\n  ${red('BREAKING CHANGE')}:`,
    name: 'breaking',
    type: 'text',
    onRender() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.rendered = highlightCursor(this._value, this.cursor)
    },
  }
}
