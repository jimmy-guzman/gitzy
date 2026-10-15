/**
 * Business-rule validation for branch parts, shared by every non-interactive
 * entry point (flag shortcut, --stdin) so they enforce the same rules the
 * interactive prompts do.
 */

import type { ResolvedConfig } from "@/core/config/types";
import { validateTypeAndScope } from "@/core/conventional/validate";

import type { BranchParts } from "./types";

/**
 * Validate branch parts against a resolved config's business rules
 *
 * @param config - Resolved configuration
 *
 * @param parts - The branch data to validate
 *
 * @returns A list of human-readable problems, empty when `parts` is valid
 */
export const validateBranchParts = (
  config: ResolvedConfig,
  parts: BranchParts
): string[] => {
  const problems = validateTypeAndScope(config, {
    scope: parts.scope ?? "",
    type: parts.type,
  });

  if (parts.subject.trim().length === 0) {
    problems.push("Subject is required");
  }

  return problems;
};
