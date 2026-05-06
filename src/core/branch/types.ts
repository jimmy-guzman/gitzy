/**
 * Types for branch name formatting
 */

/**
 * Input parts used to construct a branch name
 */
export interface BranchParts {
  issue?: string;
  scope?: string;
  subject: string;
  type: string;
}
