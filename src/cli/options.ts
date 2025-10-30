import { Option } from "commander";

import { questions } from "@/defaults/config";
import { lang } from "@/lang";

export const skipOption = new Option(
  "-S, --skip <questions...>",
  lang.flags.skip,
).choices(questions);
