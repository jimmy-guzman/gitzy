# gitzy

An interactive CLI tool for creating [Conventional Commits](https://www.conventionalcommits.org/).

## Tech Stack

- **Language:** TypeScript 5 (strict mode, ESNext target)
- **Runtime:** Node.js `^20.19.0 || >=22.12.0` (`.nvmrc` pins `22`)
- **Module system:** ESM (`"type": "module"`)
- **Package manager:** pnpm
- **Build tool:** `tsdown` (Rollup-based TypeScript bundler, outputs `dist/run.mjs`)
- **CLI framework:** `commander`
- **Interactive prompts:** `enquirer`
- **Config loading:** `lilconfig` (cosmiconfig-compatible, supports YAML/JSON/JS)
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
  cli.ts                  # Main CLI wiring: commander setup, prompt orchestration, commit dispatch
  lang.ts                 # All user-facing strings (flag descriptions, examples)
  reset.d.ts              # Applies @total-typescript/ts-reset globally
  cli/
    types.ts              # Core TS interfaces: Answers, Flags, GitzyState, EnquirerChoice
    options.ts            # Commander Option definition for --skip
    prompts/              # One file per interactive question
      constants.ts        # Shared prompt constants
      create-prompts.ts   # Assembles the active prompt list from config
      type.ts             # Autocomplete prompt with emoji-prefixed choices + fuzzy suggest
      scope.ts            # Autocomplete prompt (only shown when scopes are configured)
      subject.ts          # Input prompt with live char-count indicator & validation
      body.ts             # Multiline text prompt
      breaking.ts         # Confirm or text prompt depending on breakingChangeFormat
      issues.ts           # Text prompt for issue references
    utils/
      fuzzy-search.ts     # Generic multi-key fuzzy search via uFuzzy
      logging.ts          # Colored console helpers (info/hint/danger/warn/log)
  core/
    config/
      types.ts            # Config & TypeDetail interfaces
      defaults.ts         # defaultConfig, defaultQuestions, valid enums
      schema.ts           # Valibot ConfigSchema (validates + applies defaults)
      loader.ts           # Generic loadConfig() via lilconfig + valibot safeParse
      resolver.ts         # Orchestrates gitzy config + optional commitlint merge
      commitlint.ts       # extractCommitlintRules() maps commitlint rules → gitzy config
      commitlint-schema.ts # Valibot schema for parsing commitlint config shape
    conventional/
      types.ts            # MessageParts interface + defaultMessageParts
      message.ts          # formatMessage(), wrap(), createHead/Scope/Breaking/Issues helpers
    git/
      checks.ts           # checkIfGitRepo(), checkIfStaged(), shouldDoGitChecks()
      operations.ts       # commit() — runs git commit -m, or writes COMMIT_EDITMSG in hook mode
    store/
      store.ts            # GitzyStore<T> class — JSON file store in OS temp dir (for --retry)
      types.ts            # GitzyStoreError type
      utils.ts            # mkdir, tryUnlink, gitzyStorePath()
e2e/
  e2e.spec.ts             # E2E tests: runs the built binary via execSync with --dry-run
```

## Architecture

The codebase is split into two layers with a thin orchestration layer connecting them:

- **`src/core/`** — pure business logic with no CLI dependencies: config loading/validation, conventional commit message formatting, git operations, retry state store. All modules are UI-agnostic.
- **`src/cli/`** — all UI concerns: Commander flags, Enquirer prompt definitions, logging helpers.
- **`src/cli.ts`** — thin orchestration layer that wires the two together.
- **`src/run.ts`** — the shebang entrypoint; one-liner that calls `cli()`.

## Key Patterns

- **Path alias** `@/*` maps to `./src/*`.
- **Prompt pattern:** Each question is a single exported function (`type`, `scope`, `subject`, `body`, `breaking`, `issues`) returning an Enquirer prompt config object (or `null` to skip). `createPrompts()` composes these based on `config.questions` and `--skip` flags.
- **Config schema:** Every config file is loaded through a valibot schema with `safeParse`. Defaults are applied at the schema level via `optional(field, default)`, not manually in code. Invalid config throws a `TypeError` with a human-readable summary.
- **Logging:** All console output goes through `src/cli/utils/logging.ts` using Node's built-in `styleText` from `node:util`. No external color library at runtime.
- **Store (retry mode):** Previous answers persisted as JSON in `os.tmpdir()/gitzy/<cwd-basename>-store.json` at mode `0o0600`.
- **Bundling:** `tsdown` `commander`, `enquirer`, `valibot`, `@leeoniya/ufuzzy`, and `yaml` are inlined into `dist/run.mjs` to keep install size minimal. `lilconfig` and `tinyexec` remain as external runtime `dependencies`.
- Use `satisfies` for type narrowing when possible (e.g., `lang.ts` config objects).
- Private class fields (`#`) used in `GitzyStore`.
- `as const` used for tuple/literal types in defaults and schemas.
- `InferOutput<typeof Schema>` from valibot used to derive runtime-validated types.

## Commands

```txt
pnpm build        # Bundle src/run.ts → dist/run.mjs (minified)
pnpm test         # Run tests in watch mode
pnpm coverage     # Single-run with V8 coverage report
pnpm check        # Full suite: knip + lint + format + coverage + typecheck (check builds first)
pnpm lint         # Lint (ESLint)
pnpm lint:fix     # Lint and auto-fix
pnpm format       # Check formatting (Prettier)
pnpm format:fix   # Auto-fix formatting
pnpm typecheck    # Type check (tsc --noEmit)
pnpm knip         # Detect unused exports/dependencies
pnpm gitzy        # Run the CLI locally from source (tsx src/run.ts --commitlint)
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
  - **Interactive mode:** Run `pnpm gitzy` and answer prompts. Use `pnpm gitzy -p -a` to stage all changes first.
  - **CLI flags (for automation/non-TTY):** Use flags inline. Example: `pnpm gitzy -t feat -m "add dry-run flag" -p -a`. Available flags: `-t/--type`, `-m/--subject`, `-s/--scope`, `-d/--body`, `-b/--breaking`, `-i/--issues`, `-p/--passthrough`, `-D/--dry-run`, `--no-emoji`.
- **Allowed types:** `test`, `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `ci`
- **Allowed scopes:** `deps`, `build`, `*`, `cli`, `release`, `prompts`
- **Header rules:** 5–75 characters, lowercase type and scope, no trailing period on subject.
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
