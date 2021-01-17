import { CustomPromptObject } from './interfaces'
import { promptMessages } from './lang'
import { highlightCursor } from './utils'

export const breaking = (): CustomPromptObject => {
  return {
    message: promptMessages.breaking,
    name: 'breaking',
    type: 'text',
    onRender() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.rendered = highlightCursor(this._value, this.cursor)
    },
  }
}
