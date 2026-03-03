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
  defaultConfig,
  defaultQuestions,
  validBreakingChangeFormats,
  validIssuesPrefixes,
} from "./defaults";

const detailsSchema = record(
  string(),
  object({
    description: string(),
    emoji: string(),
  }),
);

export const ConfigSchema = object({
  breakingChangeEmoji: optional(string(), defaultConfig.breakingChangeEmoji),
  breakingChangeFormat: optional(
    picklist(validBreakingChangeFormats),
    defaultConfig.breakingChangeFormat,
  ),
  closedIssueEmoji: optional(string(), defaultConfig.closedIssueEmoji),
  details: optional(detailsSchema, defaultConfig.details),
  disableEmoji: optional(boolean(), defaultConfig.disableEmoji),
  headerMaxLength: optional(number(), defaultConfig.headerMaxLength),
  headerMinLength: optional(number(), defaultConfig.headerMinLength),
  issuesHint: optional(string(), defaultConfig.issuesHint),
  issuesPrefix: optional(
    picklist(validIssuesPrefixes),
    defaultConfig.issuesPrefix,
  ),
  questions: pipe(
    optional(array(picklist(defaultQuestions)), defaultConfig.questions),
    readonly(),
  ),
  scopes: pipe(optional(array(string()), defaultConfig.scopes), readonly()),
  types: pipe(optional(array(string()), defaultConfig.types), readonly()),
  useCommitlintConfig: optional(boolean(), defaultConfig.useCommitlintConfig),
});
