import { lang } from "./lang";
import {
  isArrayOfStrings,
  isBoolean,
  isNumber,
  isString,
  isValidDetails,
  isValidIssues,
} from "./validators";

type Scheme = (value: unknown) => boolean | string;

export const schema: Record<string, Scheme> = {
  breakingChangeEmoji: (value) => {
    return isString(value) || lang.breakingChangeEmoji;
  },
  closedIssueEmoji: (value) => {
    return isString(value) || lang.closedIssueEmoji;
  },
  details: (value) => {
    return isValidDetails(value) || lang.details;
  },
  disableEmoji: (value) => {
    return isBoolean(value) || lang.disableEmoji;
  },
  headerMaxLength: (value) => {
    return isNumber(value) || lang.headerMaxLength;
  },
  headerMinLength: (value) => {
    return isNumber(value) || lang.headerMinLength;
  },
  issuesHint: (value) => {
    return isString(value) || lang.issuesHint;
  },
  issuesPrefix: (value) => {
    return isValidIssues(value) || lang.issuesPrefix;
  },
  questions: (value) => {
    return isArrayOfStrings(value) || lang.questions;
  },
  scopes: (value) => {
    return isArrayOfStrings(value) || lang.scopes;
  },
  types: (value) => {
    return isArrayOfStrings(value) || lang.types;
  },
  useCommitlintConfig: (value) => {
    return isBoolean(value) || lang.useCommitlintConfig;
  },
};
