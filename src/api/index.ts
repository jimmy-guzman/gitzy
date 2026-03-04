/**
 * Public Node API for gitzy
 *
 * Provides programmatic access to core gitzy functionality:
 * - Config loading and resolution
 * - Conventional commit message formatting and execution
 * - Branch name formatting and creation
 * - Config file initialization
 */

export type { BranchParts } from "@/core/branch/types";
export {
  builtinTypes,
  defaultBranchConfig,
  defaultBreakingConfig,
  defaultEmojiConfig,
  defaultHeaderConfig,
  defaultIssuesConfig,
  defaultPrompts,
  defaultResolvedConfig,
} from "@/core/config/defaults";
export type { PromptName } from "@/core/config/defaults";
export {
  resolveConfig as getConfig,
  resolveConfig,
} from "@/core/config/resolver";
export { defineConfig } from "@/core/config/types";
export type {
  BranchConfig,
  BreakingConfig,
  Config,
  EmojiConfig,
  HeaderConfig,
  IssuesConfig,
  ResolvedConfig,
  ScopeEntry,
  TypeEntry,
} from "@/core/config/types";
export { formatMessageResult } from "@/core/conventional/message";
export type { CommitResult } from "@/core/conventional/message";
export type { MessageParts } from "@/core/conventional/types";
export { branch } from "@/core/git/branch";
export type { BranchOptions, BranchResult } from "@/core/git/branch";
export { commit } from "@/core/git/commit";
export type { CommitOptions } from "@/core/git/commit";
export { init } from "@/core/init/init";
export type { InitOptions, InitResult } from "@/core/init/init";
