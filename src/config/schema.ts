import type { InferOutput } from "valibot";

import {
  array,
  boolean,
  message,
  number,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  record,
  strictObject,
  string,
} from "valibot";

import {
  defaultConfig,
  questions,
  validBreakingChangeFormats,
  validIssuesPrefixes,
} from "@/defaults/config";

import { lang } from "./lang";

const detailsSchema = record(
  string(),
  object({
    description: string(),
    emoji: string(),
  }),
);

export const configSchema = strictObject({
  breakingChangeEmoji: message(
    optional(string(), defaultConfig.breakingChangeEmoji),
    lang.breakingChangeEmoji,
  ),
  breakingChangeFormat: message(
    optional(
      picklist(validBreakingChangeFormats),
      defaultConfig.breakingChangeFormat,
    ),
    lang.breakingChangeFormat,
  ),
  closedIssueEmoji: message(
    optional(string(), defaultConfig.closedIssueEmoji),
    lang.closedIssueEmoji,
  ),
  details: message(
    optional(detailsSchema, defaultConfig.details),
    lang.details,
  ),
  disableEmoji: message(
    optional(boolean(), defaultConfig.disableEmoji),
    lang.disableEmoji,
  ),
  headerMaxLength: message(
    optional(number(), defaultConfig.headerMaxLength),
    lang.headerMaxLength,
  ),
  headerMinLength: message(
    optional(number(), defaultConfig.headerMinLength),
    lang.headerMinLength,
  ),
  issuesHint: message(
    optional(string(), defaultConfig.issuesHint),
    lang.issuesHint,
  ),
  issuesPrefix: message(
    optional(picklist(validIssuesPrefixes), defaultConfig.issuesPrefix),
    lang.issuesPrefix,
  ),
  questions: message(
    pipe(
      optional(array(picklist(questions)), defaultConfig.questions),
      readonly(),
    ),
    lang.questions,
  ),
  scopes: message(
    pipe(optional(array(string()), defaultConfig.scopes), readonly()),
    lang.scopes,
  ),
  types: message(
    pipe(optional(array(string()), defaultConfig.types), readonly()),
    lang.types,
  ),
  useCommitlintConfig: message(
    optional(boolean(), defaultConfig.useCommitlintConfig),
    lang.useCommitlintConfig,
  ),
});

export type Config = InferOutput<typeof configSchema>;
export type Questions = Config["questions"];
export type IssuesPrefix = Config["issuesPrefix"];
