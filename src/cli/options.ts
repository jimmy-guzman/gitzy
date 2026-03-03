import { Option } from "commander";

import { defaultQuestions } from "@/core/config/defaults";
import { lang } from "@/lang";

export const skipOption = new Option(
  "-S, --skip <questions...>",
  lang.flags.skip,
).choices(defaultQuestions);
