import { Option } from "commander";

import { questions } from "@/defaults/config";
import { lang } from "@/lang";

export const options = {
  get skip() {
    const option = new Option("-S, --skip <questions...>", lang.flags.skip);

    option.variadic = true;
    option.choices(questions);

    return option;
  },
};
