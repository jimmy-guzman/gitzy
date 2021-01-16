import { underline } from 'kleur'

/**
 * Hack to fix simulate cursor position
 *  @todo remove once https://github.com/terkelg/prompts/issues/200 is resolved
 * @param value this._value
 * @param cursor this.cursor
 * @example
 * onRender() {
 *  this.rendered = highlightCursor(this._value, this.cursor)
 * }
 */
export const highlightCursor = (value: string, cursor: number): string => {
  return [...value].map((v, i) => (i === cursor ? underline(v) : v)).join('')
}
