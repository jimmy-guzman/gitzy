import type { Config } from "./config/gitzy-schema";

export interface Answers {
  body: string;
  breaking: boolean | string;
  issues: string;
  scope: string;
  subject: string;
  type: string;
}

export interface Flags {
  body?: string;
  breaking?: boolean | string;
  commitlint?: boolean;
  dryRun?: boolean;
  emoji?: boolean;
  help?: boolean;
  hook?: boolean;
  issues?: string;
  noEmoji?: boolean;
  passthrough?: string[];
  retry?: boolean;
  scope?: string;
  skip?: string[];
  subject?: string;
  type?: string;
  version?: boolean;
}

export interface GitzyState {
  answers: Answers;
  config: Required<Config>;
}
