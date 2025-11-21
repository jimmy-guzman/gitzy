import type { InferOutput } from "valibot";

import {
  array,
  boolean,
  number,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  record,
  string,
} from "valibot";

import {
  defaultConfig as defaults,
  questions,
  validBreakingChangeFormats,
  validIssuesPrefixes,
} from "@/defaults/config";

const detailsSchema = record(
  string(),
  object({
    description: string(),
    emoji: string(),
  }),
);

export const ConfigSchema = object({
  breakingChangeEmoji: optional(string(), defaults.breakingChangeEmoji),
  breakingChangeFormat: optional(
    picklist(validBreakingChangeFormats),
    defaults.breakingChangeFormat,
  ),
  closedIssueEmoji: optional(string(), defaults.closedIssueEmoji),
  details: optional(detailsSchema, defaults.details),
  disableEmoji: optional(boolean(), defaults.disableEmoji),
  headerMaxLength: optional(number(), defaults.headerMaxLength),
  headerMinLength: optional(number(), defaults.headerMinLength),
  issuesHint: optional(string(), defaults.issuesHint),
  issuesPrefix: optional(picklist(validIssuesPrefixes), defaults.issuesPrefix),
  questions: pipe(
    optional(array(picklist(questions)), defaults.questions),
    readonly(),
  ),
  scopes: pipe(optional(array(string()), defaults.scopes), readonly()),
  types: pipe(optional(array(string()), defaults.types), readonly()),
  useCommitlintConfig: optional(boolean(), defaults.useCommitlintConfig),
});

export type Config = InferOutput<typeof ConfigSchema>;
export type Questions = Config["questions"];
export type Scopes = Config["scopes"];
