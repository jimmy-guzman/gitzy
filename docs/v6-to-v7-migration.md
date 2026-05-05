# Migrating from v6 to v7

## Node.js

**Minimum version is now `>=22.12.0`.** Node.js 20 is no longer supported.

## Config

The flat config schema has been replaced with a nested structure. If you have a config file, you'll need to update it.

### Key Mapping

| v6 Key                 | v7 Key                                         |
| ---------------------- | ---------------------------------------------- |
| `disableEmoji`         | `emoji.enabled` (inverted)                     |
| `breakingChangeEmoji`  | `emoji.breaking`                               |
| `closedIssueEmoji`     | `emoji.issues`                                 |
| `headerMaxLength`      | `header.max`                                   |
| `headerMinLength`      | `header.min`                                   |
| `breakingChangeFormat` | `breaking.format`                              |
| `issuesPrefix`         | `issues.prefix`                                |
| `issuesHint`           | `issues.hint`                                  |
| `questions`            | `prompts`                                      |
| `details`              | `types` (array of `string \| TypeEntry`)       |
| `scopes`               | `scopes` (now supports `string \| ScopeEntry`) |
| `useCommitlintConfig`  | removed (auto-detected)                        |

### Default Value Changes

| Setting      | v6  | v7  |
| ------------ | --- | --- |
| `header.max` | 64  | 50  |
| `header.min` | 3   | 5   |
| `body.max`   | —   | 70  |
| `body.min`   | —   | 5   |

### Before / After

**v6:**

```json
{
  "disableEmoji": false,
  "breakingChangeEmoji": "💥",
  "closedIssueEmoji": "🏁",
  "headerMaxLength": 64,
  "headerMinLength": 3,
  "breakingChangeFormat": "footer",
  "issuesPrefix": "closes",
  "questions": ["type", "scope", "subject", "body", "breaking", "issues"],
  "types": ["feat", "fix", "chore"],
  "scopes": ["api", "cli"],
  "useCommitlintConfig": true
}
```

**v7:**

```json
{
  "emoji": {
    "enabled": true,
    "breaking": "💥",
    "issues": "🏁"
  },
  "header": {
    "max": 50,
    "min": 5
  },
  "breaking": {
    "format": "footer"
  },
  "issues": {
    "prefix": "closes"
  },
  "prompts": [
    "type",
    "scope",
    "subject",
    "body",
    "breaking",
    "issues",
    "coAuthors"
  ],
  "types": ["feat", "fix", "chore"],
  "scopes": ["api", "cli"]
}
```

### YAML Config Removed

YAML config files (`.gitzyrc.yaml`, `.gitzyrc.yml`) are no longer supported. Convert to JSON, JS, or TS:

- `.gitzyrc` (JSON)
- `.gitzyrc.json`
- `gitzy.config.js` / `gitzy.config.cjs` / `gitzy.config.mjs`
- `gitzy.config.ts` / `gitzy.config.mts`

All of the above are also supported inside a `.config/` subdirectory.

### TypeScript Config Files

TypeScript config files are now natively supported (no external loader required). Use `defineConfig` for type safety:

```ts
// gitzy.config.ts
import { defineConfig } from "gitzy";

export default defineConfig({
  header: { max: 72 },
  types: ["feat", "fix", "chore", "docs"],
});
```

### Commitlint Auto-Detection

The `useCommitlintConfig` flag and `--commitlint` CLI flag have been removed. Commitlint config is now **always** auto-detected and merged as a base layer (gitzy config wins on conflicts).

## CLI Flags

### Removed Flags

| Removed                 | Replacement                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `-S, --skip`            | Use the `prompts` config array to control which prompts are shown |
| `-p, --passthrough`     | Use explicit `--amend` and `--no-verify` flags                    |
| `-l, --commitlint`      | Auto-detected (no flag needed)                                    |
| `-i, --issues <string>` | Renamed to `--issue <issue...>` (repeatable)                      |

### Removed Short Aliases

Most single-letter aliases have been removed for clarity. Only these remain:

| Short | Long          |
| ----- | ------------- |
| `-m`  | `--subject`   |
| `-D`  | `--dry-run`   |
| `-a`  | `--amend`     |
| `-n`  | `--no-verify` |

Previously available short aliases (`-d`, `-b`, `-s`, `-t`, `-r`, `-H`, `-S`, `-i`) are gone. Use the full flag names instead.

### New Flags (commit)

| Flag                    | Description                         |
| ----------------------- | ----------------------------------- |
| `--co-author <name...>` | Add co-authors (repeatable)         |
| `--stdin`               | Read answers from stdin as JSON     |
| `--json`                | Output commit result as JSON        |
| `--no-emoji`            | Disable emoji in the commit message |

### New Flags (branch)

| Flag              | Description                        |
| ----------------- | ---------------------------------- |
| `--from <branch>` | Create branch from a specific base |
| `--no-checkout`   | Skip auto-checkout after creation  |
| `--json`          | Output branch name as JSON         |
| `--stdin`         | Read answers from stdin as JSON    |
| `-a, --amend`     | Rename the current branch          |
| `-D, --dry-run`   | Preview without creating           |
| `--issue <issue>` | Set issue reference inline         |

## Node API

The full programmatic API has been removed. The package now exports only:

- `defineConfig` — for typed config files
- `Config` — TypeScript type

If you were importing utilities like `formatMessage` from `"gitzy"`, those are no longer available.

## Retry Store

The `--retry` store path has moved from:

```bash
{tmpdir}/gitzy/{project}-store.json
```

to:

```bash
{tmpdir}/gitzy/v7/{project}-store.json
```

This means your first `--retry` after upgrading will start fresh. Previous retry data from v6 is not migrated (and won't cause errors).

## New Subcommands

v7 adds three explicit subcommands (running `gitzy` with no subcommand still defaults to `commit`):

| Command        | Description                            |
| -------------- | -------------------------------------- |
| `gitzy branch` | Generate a formatted branch name       |
| `gitzy init`   | Scaffold a `.gitzyrc.json` config file |
| `gitzy config` | Display the fully resolved config      |
