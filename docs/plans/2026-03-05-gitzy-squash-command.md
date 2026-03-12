# Plan: `gitzy squash` Command

**Date:** 2026-03-05  
**Branch:** `feat/v7`  
**Status:** Planned

---

## Overview

Add a `gitzy squash` subcommand that soft-resets the last N commits and re-commits them as a single conventional commit using the normal interactive prompt flow.

---

## Mechanism

`git reset --soft HEAD~N` — moves the last N commits' changes back to the working tree while keeping all changes staged. The user then fills in (or confirms pre-filled) prompts for the new combined commit message.

---

## Determining N

1. **`--count <n>` flag** — use N directly.
2. **Auto-detect (no flag)** — detect how many commits `HEAD` is ahead of the default remote branch:
   - `git symbolic-ref refs/remotes/origin/HEAD` → `refs/remotes/origin/main` → strip prefix → `origin/main`
   - `git rev-list --count HEAD ^origin/main` → N
   - Falls back gracefully if no remote exists (prompts user to use `--count`).
3. **Guard:** if N < 2, abort with a clear message: `"Nothing to squash — only N commit ahead of origin/main"`.

---

## Prompt Pre-fill

Same as `--amend`: calls `getAmendParts()` (which runs `git log -1 --pretty=%B` and parses via `parseConventionalCommit()`) to pre-fill all prompts from the HEAD commit message. The user can confirm or edit.

---

## Flags

Mirrors `gitzy commit` minus `--retry`, `--hook`, and `--amend`. Adds `--count`.

| Flag                        | Alias | Description                                                    |
| --------------------------- | ----- | -------------------------------------------------------------- |
| `--count <n>`               | `-n`  | number of commits to squash (default: commits ahead of origin) |
| `--type <type>`             | `-t`  | set type inline (with `--subject`, skips all prompts)          |
| `--scope <scope>`           | `-s`  | set scope inline                                               |
| `--subject <message>`       | `-m`  | set subject inline (with `--type`, skips all prompts)          |
| `--body <body>`             | `-d`  | set body inline                                                |
| `--breaking [breaking]`     | `-b`  | mark as breaking; add message for `footer`/`both` formats      |
| `--issue <issue...>`        | `-i`  | set issues inline (repeatable)                                 |
| `--co-author <coAuthor...>` | `-c`  | add co-authors (repeatable)                                    |
| `--dry-run`                 | `-D`  | show what would happen without touching git                    |
| `--no-verify`               | `-V`  | skip git hooks                                                 |
| `--json`                    | `-j`  | output structured JSON                                         |
| `--no-emoji`                |       | disable emoji in commit message                                |
| `--stdin`                   |       | read answers from stdin as JSON                                |

---

## Command Flow

```text
1. resolveConfig()
2. Determine count:
   - flags.count → use it
   - else → getDefaultBranch() → getCommitsAheadCount(base)
   - count < 2 → throw "Nothing to squash (only N commit ahead of <base>)"
3. checkIfGitRepo() — unless dryRun
4. getAmendParts() → pre-fill prompts from HEAD commit
5. Read --stdin answers (if flag set)
6. promptQuestions (same Enquirer pattern as commit)
   - Short-circuit if both --type and --subject are provided
7. formatMessage(config, answers, emojiEnabled)
8. if dryRun:
     log("Would squash N commits into:\n\n<message>")
   else:
     softReset(count)
     commit(message, { noVerify })
9. if --json:
     log(JSON.stringify({ count, ...CommitResult }))
```

Note: `checkIfStaged()` is **not** called — there are no staged files before the soft reset.

---

## `--dry-run` Output

```text
Would squash 3 commits into:

feat: ✨ add dark mode
```

This allows E2E tests to run without a real git repo (same pattern as `commit --dry-run` and `branch --dry-run`).

---

## `--json` Output Shape

```json
{
  "count": 3,
  "header": "feat: ✨ add dark mode",
  "body": "",
  "footer": "",
  "message": "feat: ✨ add dark mode",
  "parts": {
    "type": "feat",
    "scope": "",
    "subject": "add dark mode",
    "body": "",
    "breaking": "",
    "issues": [],
    "coAuthors": []
  }
}
```

---

## Files to Create

| File                          | Purpose                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `src/core/git/squash.ts`      | `getDefaultBranch()`, `getCommitsAheadCount(base)`, `softReset(count, dryRun)` |
| `src/core/git/squash.spec.ts` | Unit tests for all three functions (vi.mock tinyexec)                          |
| `src/cli/commands/squash.ts`  | `registerSquashCommand(program)` — flag registration + action handler          |

---

## Files to Modify

| File                 | Change                                                   |
| -------------------- | -------------------------------------------------------- |
| `src/cli/types.ts`   | Add `SquashFlags` interface                              |
| `src/lang.ts`        | Add `squash` key to `Lang` interface and `lang` object   |
| `src/cli.ts`         | Import and call `registerSquashCommand(program)`         |
| `e2e/e2e.spec.ts`    | Add `runSquash` helper + `describe("squash", ...)` block |
| `README.md`          | Add `gitzy squash` to subcommands table + flags table    |
| `AGENTS.md`          | Add `squash` to allowed commit scopes list               |
| `.commitlintrc.json` | Add `"squash"` to `scope-enum` array                     |

---

## New Git Primitives (`src/core/git/squash.ts`)

```ts
// Get the symbolic default remote branch ref (e.g. "origin/main")
// Falls back to "origin/main" if no remote is configured.
export const getDefaultBranch = async (): Promise<string>

// Count how many commits HEAD is ahead of a base ref
export const getCommitsAheadCount = async (base: string): Promise<number>

// Soft-reset HEAD~N (keeps all changes staged)
// No-ops in dryRun mode.
export const softReset = async (count: number, dryRun?: boolean): Promise<void>
```

---

## New Types (`src/cli/types.ts`)

```ts
export interface SquashFlags {
  body?: string;
  breaking?: boolean | string;
  coAuthor?: string[];
  count?: number;
  dryRun?: boolean;
  emoji?: boolean;
  issue?: string[];
  json?: boolean;
  noEmoji?: boolean;
  noVerify?: boolean;
  scope?: string;
  stdin?: boolean;
  subject?: string;
  type?: string;
}
```

---

## Edge Cases

| Scenario                                       | Behavior                                                                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--count 1` or `--count 0`                     | Error before any git ops: "count must be at least 2"                                                                                     |
| Auto-detected count is 0 or 1                  | Friendly error: "Nothing to squash — only N commit ahead of `origin/main`"                                                               |
| No remote configured                           | `getDefaultBranch` returns `"origin/main"` as fallback; `getCommitsAheadCount` likely fails → surface error asking user to use `--count` |
| `softReset` fails (e.g. merge commit in range) | git exits non-zero; tinyexec calls `process.exit` (same pattern as existing ops)                                                         |
| `--type` + `--subject` both provided           | Prompts skipped entirely (same short-circuit as commit)                                                                                  |

---

## Testing Strategy

### Unit tests (`src/core/git/squash.spec.ts`)

- Mock `tinyexec`'s `x()` via `vi.mock('tinyexec')`
- `getDefaultBranch`: returns stripped ref; falls back to `"origin/main"` on failure
- `getCommitsAheadCount`: parses stdout as number; handles 0
- `softReset`: calls correct git args; no-ops when `dryRun = true`

### E2E tests (`e2e/e2e.spec.ts`)

- Add `runSquash(args, stdin?)` helper — runs `node ./dist/run.mjs squash --dry-run <args>`, parses output after `"Would squash N commits into:\n\n"` marker
- `defaultSquashPayload()` factory matching `CommitPayload` shape
- Inline snapshot assertions (consistent with rest of e2e suite)
- Test: flags override stdin, `--type` + `--subject` skip prompts, emoji on/off

---

## Commit Scope

The new `squash` scope will be added to `.commitlintrc.json` and `AGENTS.md` before any implementation commits are made.
