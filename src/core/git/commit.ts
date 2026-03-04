/**
 * High-level commit API — formats message parts and executes git commit
 */

import type { ResolvedConfig } from "@/core/config/types";
import type { CommitResult } from "@/core/conventional/message";
import type { MessageParts } from "@/core/conventional/types";

import { formatMessageResult } from "@/core/conventional/message";

import type { CommitOptions } from "./operations";

import { commit as gitCommit } from "./operations";

export { type CommitOptions } from "./operations";

/**
 * Format message parts into a conventional commit and execute git commit
 *
 * @param config - Resolved configuration for formatting
 *
 * @param parts - The message data (type, scope, subject, etc)
 *
 * @param options - Commit options
 *
 * @param options.amend - Amend the previous commit
 *
 * @param options.dryRun - Show message without committing
 *
 * @param options.emoji - Whether to include emojis (defaults to config.emoji.enabled)
 *
 * @param options.hook - Run in git hook mode (writes to COMMIT_EDITMSG)
 *
 * @param options.noVerify - Skip git hooks (--no-verify)
 *
 * @returns Structured commit result with message, header, body, footer, and parts
 */
export const commit = async (
  config: ResolvedConfig,
  parts: MessageParts,
  options?: CommitOptions & { emoji?: boolean },
): Promise<CommitResult> => {
  const emoji = options?.emoji ?? config.emoji.enabled;
  const result = formatMessageResult(config, parts, emoji);

  await gitCommit(result.message, options);

  return result;
};
