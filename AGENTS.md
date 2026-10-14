# gitzy

An interactive CLI tool for creating [Conventional Commits](https://www.conventionalcommits.org/).

## Tech Stack

- **Language:** TypeScript 7 (strict mode, ESNext target)
- **Runtime:** Node.js (version pinned in `.nvmrc`)
- **Module system:** ESM (`"type": "module"`)
- **Package manager:** pnpm
- **Build tool:** `tsdown` (Rollup-based TypeScript bundler, outputs `dist/run.mjs` and `dist/index.mjs`)
- **CLI framework:** `commander`
- **Interactive prompts:** `@clack/prompts`
- **Config loading:** `lilconfig` (cosmiconfig-compatible, supports JSON/JS — no YAML, no `.ts`)
- **Config validation:** `valibot` (schema-first, tree-shakeable)
- **Fuzzy search:** `@leeoniya/ufuzzy`
- **Git execution:** `tinyexec` (lightweight `child_process` wrapper)
- **Formatting:** Oxfmt via Ultracite (`oxfmt.config.ts`)
- **Linting:** Oxlint via Ultracite `core` + `anti-slop` + `vitest` presets (`oxlint.config.ts`), with type-aware rules and type-check (`typeAware`/`typeCheck` via `oxlint-tsgolint`); `src/**` bans `../` imports (use `@/`)
- **Testing:** Vitest 5 with V8 coverage (unit + e2e)
- **Dead code detection:** Knip
- **Spell checking:** cspell, run on staged files by lint-staged at commit time; add new words to `cspell.json` `words`

## Project Structure

```txt
src/
  run.ts                  # Entrypoint: shebang, calls cli()
  cli.ts                  # Main CLI wiring: commander setup, registers all subcommands
  lang.ts                 # All user-facing strings (flag descriptions, examples)
  reset.d.ts              # Applies @total-typescript/ts-reset globally
  index.ts                # Public Node API exports (second tsdown entry → dist/index.mjs)
  cli/
    types.ts              # Core TS interfaces: Answers, CommitFlags, BranchFlags, GitzyState, Prompter
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
      stdin.ts            # readStdinJson(schema) — reads --stdin JSON and validates it with valibot
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
      parser.ts           # parseBranchName() — recovers parts from a branch name (--amend)
    conventional/
      types.ts            # MessageParts interface + defaultMessageParts
      schema.ts           # PartialMessagePartsSchema — validates answers from stdin and the retry store
      message.ts          # formatMessage(), wrap(), isEmojiEnabled(), GITZY_NO_EMOJI support
    git/
      checks.ts           # checkIfGitRepo(), checkIfStaged(), shouldDoGitChecks()
      operations.ts       # commit() — runs git commit -m, or writes COMMIT_EDITMSG in hook mode
      branch.ts           # createBranch(), renameBranch(), getCurrentBranch()
      amend.ts            # getAmendParts(), parseConventionalCommit() — pre-fill from HEAD
    init/
      init.ts             # init() — generates gitzy.config.js in cwd
    guards.ts             # isString() type predicate (keeps `typeof` inside a named guard)
    store/
      store.ts            # GitzyStore<T> class — JSON file store in OS temp dir (for --retry)
      utils.ts            # mkdir, gitzyStorePath()
e2e/
  e2e.spec.ts             # E2E tests: runs the built binary via execSync with --dry-run/--stdin
```

## Architecture

The codebase is split into two layers with a thin orchestration layer connecting them:

- **`src/core/`** — pure business logic with no CLI dependencies: config loading/validation, conventional commit message formatting, branch name formatting, git operations, retry state store. All modules are UI-agnostic.
- **`src/cli/`** — all UI concerns: Commander flags, `@clack/prompts` prompt definitions, subcommand registrations.
- **`src/cli.ts`** — thin orchestrator that registers all four Commander subcommands.
- **`src/run.ts`** — the shebang entrypoint; one-liner that calls `cli()`.
- **`src/index.ts`** — public Node API (`defineConfig`, `Config`), re-exported from `src/core/` only.

## Key Patterns

- **Path alias** `@/*` maps to `./src/*`.
- **Subcommands:** `gitzy` alone runs the default `commit` subcommand. Explicit subcommands: `branch`, `init`, `config`.
- **Prompt pattern:** Each question (`type`, `scope`, `subject`, `body`, `breaking`, `issues`, `coAuthors`, `signoff`) is an exported factory that takes the prompt options and returns a function that either resolves the autofilled answer, calls a `@clack/prompts` prompt, or returns `undefined` to skip. Factories call clack through the injected `prompter` (a `Prompter` from `src/cli/types.ts`); `createPrompts()` defaults it to `@clack/prompts`, collects the prompts listed in `config.prompts`, and runs them with `prompter.group()`.
- **Config schema:** Every config file is loaded through a valibot schema with `safeParse`. Defaults are applied at the schema level via `optional(field, default)`, not manually in code. Invalid config throws a `TypeError` with a human-readable summary.
- **Config normalization:** `normalizeConfig()` converts `string` type entries (short form) to full `TypeEntry` objects by looking them up in `builtinTypes`.
- **Logging:** All CLI output goes through `@clack/prompts` (`log.*`, `cancel`). No `console.*` calls and no color library.
- **Emoji:** Controlled by `config.emoji.enabled` (config) and the `GITZY_NO_EMOJI` env var. No `--no-emoji` CLI flag.
- **`--stdin`:** Both `commit` and `branch` commands accept JSON answers piped via stdin, validated with a valibot schema and merged with CLI flags (flags take priority over stdin).
- **`--amend` (commit):** Parses HEAD commit message with `getAmendParts()` to pre-fill prompts (best-effort regex parsing).
- **`--amend` (branch):** Renames the current branch via `git branch -m`. Warns if a remote tracking ref exists.
- **Store (retry mode):** Previous answers persisted as JSON in `os.tmpdir()/gitzy/v7/<cwd-basename>-store.json` at mode `0o0600`; reads are validated with `PartialMessagePartsSchema`, so a corrupt or unexpected file loads as `{}`.
- **Bundling:** `tsdown` bundles every runtime package listed in `deps.onlyBundle` (`tsdown.config.ts`): `@clack/prompts` and its dependencies, `commander`, `valibot`, `@leeoniya/ufuzzy`, `lilconfig`, `tinyexec`. The published package has no runtime `dependencies`.
- **Node API:** `src/index.ts` is the second tsdown entry → `dist/index.mjs`. The `exports` map in `package.json` points `"."` to this file.
- Use `satisfies` for type narrowing when possible (e.g., `lang.ts` config objects).
- Private class fields (`#`) used in `GitzyStore`.
- `as const` used for tuple/literal types in defaults and schemas.
- `InferOutput<typeof Schema>` from valibot used to derive runtime-validated types.

## Commands

```txt
pnpm build        # Bundle src/run.ts + src/index.ts → dist/ (minified)
pnpm test         # Run tests in watch mode
pnpm coverage     # Single-run with V8 coverage report
pnpm check        # Full suite: knip + lint + format + coverage + typecheck (check builds first)
pnpm lint         # Lint (Oxlint)
pnpm lint:fix     # Lint and auto-fix
pnpm format       # Check formatting (Oxfmt)
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
- **Vitest globals:** `globals: true` is set — `describe`, `it`, `expect`, `vi` must not be imported (enforced by `oxlint.config.ts`).
- **No module mocking:** `vi.mock` is banned by anti-slop's `no-module-mocking`. Use these instead:
  - Prompts: pass `createFakePrompter()` from `src/cli/prompts/test-utils.ts`.
  - git: use real temp repos via `useTempGitRepo()` / `git()` from `src/core/git/test-utils.ts`.
  - fs/config: write real files in an `mkdtemp` dir and `process.chdir` into it.
  - Local modules: `vi.spyOn(module, "fn")` is fine.
  - Use typed `vi.fn<typeof fn>()` for fakes.
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

- Use other linters or formatters — this project uses Ultracite's Oxlint + Oxfmt presets.
- Turn off Ultracite rules to make lint pass — fix the code instead.
- Add unnecessary type assertions (`as`, `!`, `any`) without first exhausting proper solutions.
- Leave unused exports, dependencies, or files — run `pnpm knip` to detect and remove them.
- Leave tests in a failing state — after making changes, run `pnpm coverage` and fix any broken tests before finishing.
- Leave lint errors — after making changes, run `pnpm lint` and fix any errors before finishing.
- Leave the build broken — after making changes, run `pnpm build` and fix any errors before finishing.
- Leave comments in the codebase that are not JSDoc, TODO/FIXME notes, or the `// SAFETY:` justification anti-slop requires on an unavoidable type assertion.
- Use redundant return types for internal functions that can be inferred.
- Forget to update docs — after introducing a new pattern, feature, convention, or structural change, ask the user if `AGENTS.md` and/or `README.md` should be updated, then apply the changes.
