/**
 * Core types for conventional commit message formatting
 */

/**
 * The data parts needed to construct a conventional commit message
 * This is the core interface that replaces `Answers` from the old architecture
 */
export interface MessageParts {
  body: string;
  breaking: boolean | string;
  issues: string;
  scope: string;
  subject: string;
  type: string;
}

/**
 * Default empty message parts
 */
export const defaultMessageParts: MessageParts = {
  body: "",
  breaking: false,
  issues: "",
  scope: "",
  subject: "",
  type: "",
};
