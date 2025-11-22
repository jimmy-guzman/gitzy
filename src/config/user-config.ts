/**
 * Gitzy configuration.
 *
 * All fields are optional; anything you omit falls back to Gitzy’s defaults.
 */
export interface UserConfig {
  /**
   * Emoji used in the `BREAKING CHANGE` footer.
   *
   * @example "🧨"
   *
   * @default "💥"
   */
  breakingChangeEmoji?: string;

  /**
   * Format used to represent breaking changes.
   *
   * - `"!"`      – add `!` to the commit header
   * - `"footer"` – add a `BREAKING CHANGE` footer
   * - `"both"`   – use both header and footer
   *
   * @default "footer"
   */
  breakingChangeFormat?: "!" | "both" | "footer";

  /**
   * Emoji used in the “closes #123” issues footer line.
   *
   * @example "🙂"
   *
   * @default "🏁"
   */
  closedIssueEmoji?: string;

  /**
   * Per-type descriptions and emojis used in the CLI prompts
   * and generated commit messages.
   *
   * Keys are commit types (e.g. "feat", "fix").
   */
  details?: Record<
    string,
    {
      /**
       * Human-readable description for this type.
       *
       * @example "A new feature"
       */
      description: string;
      /**
       * Emoji to display for this type.
       *
       * @example "✨"
       */
      emoji: string;
    }
  >;

  /**
   * When true, disables all emojis in prompts and commit messages.
   * Overrides `breakingChangeEmoji`, `closedIssueEmoji`, and `details.*.emoji`.
   *
   * @default false
   */
  disableEmoji?: boolean;

  /**
   * Maximum allowed length for the commit header (type/scope/subject).
   *
   * @default 64
   */
  headerMaxLength?: number;

  /**
   * Minimum required length for the commit header subject.
   *
   * @default 3
   */
  headerMinLength?: number;

  /**
   * Hint text shown for the “issues” question.
   *
   * @default "#123, #456, resolves #789, org/repo#100"
   */
  issuesHint?: string;

  /**
   * Prefix keyword used when generating the issues footer.
   * Must match GitHub’s supported close/fix/resolve keywords.
   *
   * @default "closes"
   */
  issuesPrefix?:
    | "close"
    | "closed"
    | "closes"
    | "fix"
    | "fixed"
    | "fixes"
    | "resolve"
    | "resolved"
    | "resolves";

  /**
   * Controls which interactive questions are asked.
   *
   * The `scope` question is automatically skipped if no scopes are configured.
   *
   * @default ["type", "scope", "subject", "body", "breaking", "issues"]
   */
  questions?: ("body" | "breaking" | "issues" | "scope" | "subject" | "type")[];

  /**
   * List of scopes to choose from in the “scope” prompt.
   * If empty or omitted, the scope question is skipped.
   *
   * @example ["core", "web", "api"]
   *
   * @default []
   */
  scopes?: string[];

  /**
   * List of commit types to choose from in the “type” prompt.
   * Types can be further customized via `details`.
   *
   * @default ["chore","docs","feat","fix","refactor","test","style","ci","perf","revert","release"]
   */
  types?: string[];

  /**
   * When true, pulls defaults from the local commitlint config (if present):
   *
   * - `types`           → `rules["type-enum"][2]`
   * - `scopes`          → `rules["scope-enum"][2]`
   * - `headerMaxLength` → `rules["header-max-length"][2]`
   * - `headerMinLength` → `rules["header-min-length"][2]`
   *
   * @default false
   */
  useCommitlintConfig?: boolean;
}
