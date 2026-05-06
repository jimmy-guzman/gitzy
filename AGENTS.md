# gitzy

An interactive CLI tool for creating [Conventional Commits](https://www.conventionalcommits.org/).

## Tech Stack

- **Language:** TypeScript 5 (strict mode, ESNext target)
- **Runtime:** Node.js `^20.19.0 || >=22.12.0` (`.nvmrc` pins `22`)
- **Module system:** ESM (`"type": "module"`)
- **Package manager:** pnpm
- **Build tool:** `tsdown` (Rollup-based TypeScript bundler, outputs `dist/run.mjs` and `dist/api/index.mjs`)
- **CLI framework:** `commander`
- **Interactive prompts:** `enquirer`
- **Config loading:** `lilconfig` (cosmiconfig-compatible, supports JSON/JS — no YAML, no `.ts`)
- **Config validation:** `valibot` (schema-first, tree-shakeable)
- **Fuzzy search:** `@leeoniya/ufuzzy`
- **Git execution:** `tinyexec` (lightweight `child_process` wrapper)
- **Formatting:** Prettier 3 with `@jimmy.codes/prettier-config`
- **Linting:** ESLint 9 with `@jimmy.codes/eslint-config` (flat config)
- **Testing:** Vitest 4 with V8 coverage (unit + e2e)
- **Dead code detection:** Knip
- **Spell checking:** cspell

## Project Structure

```txt
src/
  run.ts                  # Entrypoint: shebang, calls cli()
  cli.ts                  # Main CLI wiring: commander setup, registers all subcommands
  lang.ts                 # All user-facing strings (flag descriptions, examples)
  reset.d.ts              # Applies @total-typescript/ts-reset globally
  api/
    index.ts              # Public Node API exports (second tsdown entry → dist/api/index.mjs)
  cli/
    types.ts              # Core TS interfaces: Answers, CommitFlags, BranchFlags, GlobalFlags, GitzyState
    prompts/              # One file per interactive question
      constants.ts        # Shared prompt constants
      create-prompts.ts   # Assembles the active prompt list from config.prompts
      type.ts             # Autocomplete prompt with emoji-prefixed choices + fuzzy suggest
      scope.ts            # Autocomplete prompt (only shown when scopes are configured)
      subject.ts          # Input prompt with live char-count indicator & validation
      body.ts             # Multiline text prompt
      breaking.ts         # Confirm or text prompt depending on breaking.format
      issues.ts           # Text prompt for issue references
    commands/
      commit.ts           # Default subcommand: full conventional commit flow
      branch.ts           # Branch name generation flow
      init.ts             # Generates a starter gitzy.config.js
      config.ts           # Displays resolved config (--json for machine-readable output)
    utils/
      fuzzy-search.ts     # Generic multi-key fuzzy search via uFuzzy
      logging.ts          # Colored console helpers (info/hint/danger/warn/log)
  core/
    config/
      types.ts            # Config, ResolvedConfig, TypeEntry, ScopeEntry, defineConfig() interfaces
      defaults.ts         # defaultResolvedConfig, builtinTypes, per-section defaults
      schema.ts           # Valibot ConfigSchema (validates + applies defaults)
      loader.ts           # Generic loadConfig() via lilconfig + valibot safeParse
      normalizer.ts       # normalizeConfig() — resolves string type names to TypeEntry objects
      resolver.ts         # resolveConfig() — auto-detects gitzy + commitlint config
      commitlint.ts       # extractCommitlintRules() maps commitlint rules → gitzy config
      commitlint-schema.ts # Valibot schema for parsing commitlint config shape
    branch/
      types.ts            # BranchParts interface
      formatter.ts        # formatBranchName(), slugify()
    conventional/
      types.ts            # MessageParts interface + defaultMessageParts
      message.ts          # formatMessage(), wrap(), isEmojiEnabled(), GITZY_NO_EMOJI support
    git/
      checks.ts           # checkIfGitRepo(), checkIfStaged(), shouldDoGitChecks()
      operations.ts       # commit() — runs git commit -m, or writes COMMIT_EDITMSG in hook mode
      branch.ts           # createBranch(), renameBranch(), getCurrentBranch()
      amend.ts            # getAmendParts(), parseConventionalCommit() — pre-fill from HEAD
    init/
      init.ts             # init() — generates gitzy.config.js in cwd
    store/
      store.ts            # GitzyStore<T> class — JSON file store in OS temp dir (for --retry)
      types.ts            # GitzyStoreError type
      utils.ts            # mkdir, tryUnlink, gitzyStorePath()
e2e/
  e2e.spec.ts             # E2E tests: runs the built binary via execSync with --dry-run/--stdin
```

## Architecture

The codebase is split into two layers with a thin orchestration layer connecting them:

- **`src/core/`** — pure business logic with no CLI dependencies: config loading/validation, conventional commit message formatting, branch name formatting, git operations, retry state store. All modules are UI-agnostic.
- **`src/cli/`** — all UI concerns: Commander flags, Enquirer prompt definitions, logging helpers, subcommand registrations.
- **`src/cli.ts`** — thin orchestrator that registers all four Commander subcommands.
- **`src/run.ts`** — the shebang entrypoint; one-liner that calls `cli()`.
- **`src/api/index.ts`** — public Node API re-exports from `src/core/` only.

## Key Patterns

- **Path alias** `@/*` maps to `./src/*`.
- **Subcommands:** `gitzy` alone runs the default `commit` subcommand. Explicit subcommands: `branch`, `init`, `config`.
- **Prompt pattern:** Each question is a single exported function (`type`, `scope`, `subject`, `body`, `breaking`, `issues`) returning an Enquirer prompt config object (or `null` to skip). `createPrompts()` composes these based on `config.prompts`.
- **Config schema:** Every config file is loaded through a valibot schema with `safeParse`. Defaults are applied at the schema level via `optional(field, default)`, not manually in code. Invalid config throws a `TypeError` with a human-readable summary.
- **Config normalization:** `normalizeConfig()` converts `string` type entries (short form) to full `TypeEntry` objects by looking them up in `builtinTypes`.
- **Logging:** All console output goes through `src/cli/utils/logging.ts` using Node's built-in `styleText` from `node:util`. No external color library at runtime.
- **Emoji:** Controlled by `config.emoji.enabled` (config) and the `GITZY_NO_EMOJI` env var. No `--no-emoji` CLI flag.
- **`--stdin`:** Both `commit` and `branch` commands accept JSON answers piped via stdin, merged with CLI flags (flags take priority over stdin).
- **`--amend` (commit):** Parses HEAD commit message with `getAmendParts()` to pre-fill prompts (best-effort regex parsing).
- **`--amend` (branch):** Renames the current branch via `git branch -m`. Warns if a remote tracking ref exists.
- **Store (retry mode):** Previous answers persisted as JSON in `os.tmpdir()/gitzy/<cwd-basename>-store.json` at mode `0o0600`.
- **Bundling:** `tsdown` inlines `ansi-colors`, `commander`, `enquirer`, `valibot`, `@leeoniya/ufuzzy` into `dist/run.mjs`. `lilconfig` and `tinyexec` remain external runtime `dependencies`.
- **Node API:** `src/api/index.ts` is the second tsdown entry → `dist/api/index.mjs`. The `exports` map in `package.json` points `"."` to this file.
- Use `satisfies` for type narrowing when possible (e.g., `lang.ts` config objects).
- Private class fields (`#`) used in `GitzyStore`.
- `as const` used for tuple/literal types in defaults and schemas.
- `InferOutput<typeof Schema>` from valibot used to derive runtime-validated types.

## Commands

```txt
pnpm build        # Bundle src/run.ts + src/api/index.ts → dist/ (minified)
pnpm test         # Run tests in watch mode
pnpm coverage     # Single-run with V8 coverage report
pnpm check        # Full suite: knip + lint + format + coverage + typecheck (check builds first)
pnpm lint         # Lint (ESLint)
pnpm lint:fix     # Lint and auto-fix
pnpm format       # Check formatting (Prettier)
pnpm format:fix   # Auto-fix formatting
pnpm typecheck    # Type check (tsc --noEmit)
pnpm knip         # Detect unused exports/dependencies
pnpm gitzy        # Run the CLI locally from source (tsx src/run.ts)
```

## Verification

After **every** set of changes, run all of these checks before considering the task done. Do NOT skip any step.

```txt
pnpm knip         # 0. Check for unused code/deps (fix before proceeding)
pnpm typecheck    # 1. Type check
pnpm lint         # 2. Lint (fix errors before proceeding)
pnpm coverage     # 3. Unit tests with coverage
pnpm build        # 4. Production build (MUST pass)
```

If any step fails, fix the issue and re-run from that step. Do not move on until all pass.

## Conventions

- **TypeScript:** strict mode with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `strictNullChecks` all enforced.
- **Test files:** use the `.spec.ts` suffix and live next to the code they test (`src/**/*.spec.ts`). E2E tests live in `e2e/`.
- **Inline snapshots:** `toMatchInlineSnapshot` is used heavily for commit message output verification — prefer this over string assertions for message formatting tests.
- **Test helpers:** factory/setup functions (e.g., `setupFormatCommitMessage()`) keep test DRY using spread-based config/answer overrides for targeted scenarios.
- **Vitest globals:** `globals: true` is set — `describe`, `it`, `expect` do not need to be imported.
- Sort object keys and import statements alphabetically.
- Prefer named exports over default exports.
- Use `replaceAll()` instead of `replace()` with global regex (enforced by linter).
- Use template literals instead of string concatenation (enforced by linter).
- Use `**` operator instead of `Math.pow()` (enforced by linter).

## Branching & Commits

- **Commits:** Use `pnpm gitzy` to create commits. It enforces Conventional Commits format. Two approaches:
  - **Interactive mode:** Run `pnpm gitzy` and answer prompts.
  - **CLI flags (for automation/non-TTY):** Use flags inline. Example: `pnpm gitzy --type feat -m "add dry-run flag" -D`. Available flags: `--type`, `-m/--subject`, `--scope`, `--body`, `--breaking`, `--issue`, `-D/--dry-run`, `-a/--amend`, `-n/--no-verify`, `--co-author`.
- **Allowed types:** `test`, `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `ci`
- **Allowed scopes:** `deps`, `build`, `*`, `api`, `branch`, `cli`, `config`, `release`, `prompts`
- **Header rules:** 5–50 characters, lowercase type and scope, no trailing period on subject.
- **Pull requests:** Branch off `main`, push, and open a PR with `gh pr create`. Merge commits are disabled — use squash merge.
- **Working on `main`:** Create a new branch before committing. Do not commit directly to `main`.

## Do NOT

- Use Prettier alternatives — this project uses Prettier (not oxfmt or others).
- Add unnecessary type assertions (`as`, `!`, `any`) without first exhausting proper solutions.
- Leave unused exports, dependencies, or files — run `pnpm knip` to detect and remove them.
- Leave tests in a failing state — after making changes, run `pnpm coverage` and fix any broken tests before finishing.
- Leave lint errors — after making changes, run `pnpm lint` and fix any errors before finishing.
- Leave the build broken — after making changes, run `pnpm build` and fix any errors before finishing.
- Leave comments in the codebase that are not JSDoc or TODO/FIXME notes.
- Use redundant return types for internal functions that can be inferred.
- Forget to update docs — after introducing a new pattern, feature, convention, or structural change, ask the user if `AGENTS.md` and/or `README.md` should be updated, then apply the changes.
