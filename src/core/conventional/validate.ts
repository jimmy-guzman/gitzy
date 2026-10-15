/**
 * Business-rule validation for message parts, shared by every non-interactive
 * entry point (flag shortcut, --stdin, --retry) so they enforce the same
 * rules the interactive prompts do.
 */

import type { ResolvedConfig } from "@/core/config/types";
import { pluralize } from "@/core/pluralize";

import { formatBody, formatMessageResult } from "./message";
import type { MessageParts } from "./types";

const hasScope = (scope: string) => scope !== "" && scope !== "none";

/**
 * Validate message parts against a resolved config's business rules
 *
 * @param config - Resolved configuration
 *
 * @param parts - The message data to validate
 *
 * @param emoji - Whether emoji are enabled, for measuring the real header length
 *
 * @returns A list of human-readable problems, empty when `parts` is valid
 */
export const validateMessageParts = (
  config: ResolvedConfig,
  parts: MessageParts,
  emoji: boolean
): string[] => {
  const problems: string[] = [];

  if (!config.types.some((type) => type.name === parts.type)) {
    const allowed = config.types.map((type) => type.name).join(", ");

    problems.push(`Invalid type "${parts.type}". Allowed types: ${allowed}`);
  }

  if (
    config.scopes.length > 0 &&
    hasScope(parts.scope) &&
    !config.scopes.some((scope) => scope.name === parts.scope)
  ) {
    const allowed = config.scopes.map((scope) => scope.name).join(", ");

    problems.push(`Invalid scope "${parts.scope}". Allowed scopes: ${allowed}`);
  }

  const { min: subjectMin } = config.header;

  if (parts.subject.length < subjectMin) {
    problems.push(
      `Add ${pluralize(subjectMin - parts.subject.length, "more character")} (minimum ${subjectMin})`
    );
  }

  const { header } = formatMessageResult(config, parts, emoji);

  if (header.length > config.header.max) {
    const overBy = header.length - config.header.max;

    problems.push(
      `Remove ${pluralize(overBy, "character")} from the header (max ${config.header.max})`
    );
  }

  const { max: bodyMax, min: bodyMin } = config.body;
  const bodyLength = formatBody(config, parts.body).length;

  if (bodyLength > 0 && bodyLength < bodyMin) {
    problems.push(
      `Add ${pluralize(bodyMin - bodyLength, "more character")} to the body (minimum ${bodyMin})`
    );
  }

  if (bodyMax !== undefined && bodyLength > bodyMax) {
    problems.push(
      `Remove ${pluralize(bodyLength - bodyMax, "character")} from the body (max ${bodyMax})`
    );
  }

  return problems;
};
