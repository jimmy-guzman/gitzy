import { CustomPromptObject } from './interfaces'
import { highlightCursor } from './utils'

export const body = (): CustomPromptObject => {
  return {
    message: 'Provide a longer description of the change:\n ',
    name: 'body',
    type: 'text',
    onRender() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.rendered = highlightCursor(this._value, this.cursor)
    },
  }
}
