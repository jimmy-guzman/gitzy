import commander, { Option } from 'commander'

import { lang } from '../lang'
import { questions } from '../defaults'

export const options = {
  get skip(): commander.Option {
    const option = new Option('-S, --skip <questions...>', lang.flags.skip)

    option.variadic = true
    option.choices(questions)

    return option
  },
}
