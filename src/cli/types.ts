import type * as clack from "@clack/prompts";

import type { ResolvedConfig } from "@/core/config/types";
import type { MessageParts } from "@/core/conventional/types";

export type Answers = MessageParts;

/**
 * The clack prompts gitzy uses, injectable so tests can supply fakes
 */
export interface Prompter {
  autocomplete: (
    opts: clack.AutocompleteOptions<string>
  ) => Promise<string | symbol>;
  cancel: typeof clack.cancel;
  confirm: typeof clack.confirm;
  group: typeof clack.group;
  isCancel: typeof clack.isCancel;
  multiline: typeof clack.multiline;
  text: typeof clack.text;
}

export interface CreatedPromptOptions {
  answers: Answers;
  autofill?: Partial<Answers>;
  config: ResolvedConfig;
  flags: CommitFlags;
  initial?: Partial<Answers>;
  prompter: Prompter;
}

export interface CommitFlags {
  amend?: boolean;
  body?: string;
  breaking?: boolean | string;
  coAuthor?: string[];
  dryRun?: boolean;
  emoji?: boolean;
  hook?: boolean;
  issue?: string[];
  json?: boolean;
  noEmoji?: boolean;
  noVerify?: boolean;
  retry?: boolean;
  scope?: string;
  signoff?: boolean | string;
  stdin?: boolean;
  subject?: string;
  type?: string;
}

export interface BranchFlags {
  amend?: boolean;
  checkout?: boolean;
  dryRun?: boolean;
  from?: string;
  issue?: string;
  json?: boolean;
  scope?: string;
  stdin?: boolean;
  subject?: string;
  type?: string;
}

export interface GitzyState {
  answers: Answers;
  config: ResolvedConfig;
}
