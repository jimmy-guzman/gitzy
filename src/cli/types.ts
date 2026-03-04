import type { ResolvedConfig } from "@/core/config/types";
import type { MessageParts } from "@/core/conventional/types";

export type Answers = MessageParts;

export interface CreatedPromptOptions {
  answers: Answers;
  config: ResolvedConfig;
  flags: CommitFlags;
  initial?: Partial<Answers>;
}

export interface EnquirerChoice {
  hint?: string;
  indent?: string;
  message: string;
  name: string;
  title: string;
  value: string;
}

export interface EnquirerState {
  answers: Answers;
  input: string;
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

export interface GlobalFlags {
  json?: boolean;
}

export interface GitzyState {
  answers: Answers;
  config: ResolvedConfig;
}
