# gitzy 🪄

> Interactive [conventional commits][conventional-commits] CLI with branch name generation, commitlint integration, and a public Node API.

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img width="750" src="./assets/demo.cast.svg" alt="Gitzy CLI screenshot"><br>
  <sub>Recorded with <a href="https://github.com/MrMarble/termsvg">termsvg</a> (glyphs look better IRL)</sub>
</p>
<!-- markdownlint-enable MD033 -->

![actions][actions-badge]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![Install Size][install-size-badge]][packagephobia]
[![License][license-badge]][license]
[![Code Coverage][coverage-badge]][coverage]

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Subcommands](#subcommands)
- [Configuration](#configuration)
- [Config Options](#config-options)
- [Node API](#node-api)

## Features

- Interactive conventional commit flow (`type`, `scope`, `subject`, `body`, `breaking`, `issues`)
- Branch name generation from conventional commit prompts
- Partial commitlint configuration support
- Config validation via schema
- Multiple breaking-change formats (`!`, `footer`, `both`)
- Flexible emoji control (`emoji.enabled` config or `GITZY_NO_EMOJI` env var)
- Customizable type descriptions and emojis
- Dynamic scopes and types (string shorthand or full `{ name, description }` objects)
- Jira and GitHub issue reference patterns
- Co-author support via `--co-author`
- Retry (`--retry`), dry-run (`--dry-run`), amend (`--amend`), and hook (`--hook`) modes
- JSON output (`--json`) for scripting and CI
- `--no-emoji` flag (precedence: `--no-emoji` > `GITZY_NO_EMOJI` env > `emoji.enabled` config)
- `--stdin` for piping answers as JSON (both `commit` and `branch`)
- Public Node API (`dist/api/index.mjs`)
- ⚡ [Lightweight (~300 kB install)][packagephobia]

## Usage

```sh-session
npx gitzy
# or
npm install -g gitzy
gitzy
gitzy commit -t feat -m "add dark mode"
gitzy branch -t feat -m "add dark mode" -s ui
```

## Subcommands

`gitzy` alone runs the default `commit` subcommand. Explicit subcommands:

| Subcommand     | Description                                                                    |
| -------------- | ------------------------------------------------------------------------------ |
| `gitzy`        | Alias for `gitzy commit`                                                       |
| `gitzy commit` | Interactive conventional commit flow (default)                                 |
| `gitzy branch` | Generate a branch name from a conventional commit prompt                       |
| `gitzy init`   | Generate a starter `.gitzyrc.json` in the current dir (`--force` to overwrite) |
| `gitzy config` | Display the resolved config (`--json` for machine output)                      |

### `gitzy commit` flags

| Flag                        | Alias | Description                                                       |
| --------------------------- | ----- | ----------------------------------------------------------------- |
| `--type <type>`             | `-t`  | set type inline                                                   |
| `--scope <scope>`           | `-s`  | set scope inline                                                  |
| `--subject <message>`       | `-m`  | set subject inline                                                |
| `--body <body>`             | `-d`  | set body inline                                                   |
| `--breaking [breaking]`     | `-b`  | mark as breaking; add message for `footer`/`both` formats         |
| `--issue <issue...>`        | `-i`  | set issues inline (repeatable: `-i '#123' -i '#456'`)             |
| `--dry-run`                 | `-D`  | show commit message without committing                            |
| `--retry`                   | `-r`  | retry last commit and skip prompts                                |
| `--amend`                   | `-a`  | amend the previous commit (pre-fills prompts from HEAD)           |
| `--no-verify`               | `-n`  | skip git hooks                                                    |
| `--json`                    | `-j`  | output structured JSON `{ message, header, body, footer, parts }` |
| `--no-emoji`                |       | disable emoji in commit message                                   |
| `--co-author <coAuthor...>` | `-c`  | add co-authors (repeatable: `-c "Name <email>"`)                  |
| `--hook`                    | `-H`  | enable running inside a git hook (e.g. `prepare-commit-msg`)      |
| `--stdin`                   |       | read answers from stdin as JSON (CLI flags take priority)         |
| `--help`                    | `-h`  | display help for command                                          |

### `gitzy branch` flags

| Flag                  | Alias | Description                                               |
| --------------------- | ----- | --------------------------------------------------------- |
| `--type <type>`       | `-t`  | set type inline                                           |
| `--scope <scope>`     | `-s`  | set scope inline                                          |
| `--subject <subject>` | `-m`  | set subject inline                                        |
| `--issue <issue>`     | `-i`  | set issue reference inline (e.g. `#42` or `PROJ-123`)     |
| `--from <branch>`     | `-f`  | create the branch from a base branch                      |
| `--amend`             | `-a`  | rename the current branch instead of creating a new one   |
| `--no-checkout`       |       | do not checkout the new branch after creating it          |
| `--dry-run`           | `-D`  | show branch name without creating it                      |
| `--json`              | `-j`  | output result as JSON                                     |
| `--stdin`             |       | read answers from stdin as JSON (CLI flags take priority) |
| `--help`              | `-h`  | display help for command                                  |

## Configuration

By default, `gitzy` works out of the box. You can configure it via a `gitzy` key in `package.json`, or one of the following files:

`.gitzyrc`, `.gitzyrc.json`, `.gitzyrc.js`, `.gitzyrc.cjs`, `.gitzyrc.mjs`,
`gitzy.config.js`, `gitzy.config.cjs`, `gitzy.config.mjs`, `gitzy.config.ts`, `gitzy.config.mts`

> [!NOTE]
> All of these files can also live under a `.config/` directory. TypeScript config files (`.ts`/`.mts`) are supported natively on Node 22 via `--experimental-strip-types`.

Use `defineConfig` for editor autocomplete:

```js
// gitzy.config.js
import { defineConfig } from "gitzy";

export default defineConfig({
  // see options below
});
```

## Config Options

### `types`

List of commit types. Accepts strings (looked up from builtins) or full objects.

```js
types: ["feat", "fix", "chore", "docs", "refactor", "test", "style", "ci"];
// or with custom descriptions/emojis:
types: [
  { name: "feat", description: "A new feature", emoji: "✨" },
  { name: "fix", description: "Fix a bug", emoji: "🐛" },
];
```

**Built-in types:** `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `release`, `revert`, `style`, `test`

### `scopes`

List of scopes to choose from. Enables the `scope` prompt when non-empty.

```js
scopes: ["api", "ui", "cli"];
// or with descriptions:
scopes: [{ name: "api", description: "Public API surface" }, { name: "ui" }];
```

### `prompts`

Controls which prompts are shown and in what order.

```js
prompts: [
  "type",
  "scope",
  "subject",
  "body",
  "breaking",
  "issues",
  "coAuthors",
];
```

### `header`

Controls the commit header length validation.

```js
header: {
  max: 64, // default
  min: 3,  // default
}
```

### `breaking`

Controls the breaking change prompt behavior.

- `"!"` — append `!` to the type/scope, ask yes/no
- `"footer"` — prompt for a description, add a `BREAKING CHANGE` footer (default)
- `"both"` — add both `!` and a footer

```js
breaking: {
  format: "footer", // "!", "footer", or "both"
}
```

#### Examples

```sh
# "!" format
feat!: send an email to the customer when a product is shipped

# "footer" format
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files

# "both" format
chore!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```

### `emoji`

Controls emoji rendering.

```js
emoji: {
  enabled: true,    // default; set to false or use GITZY_NO_EMOJI env var to disable
  breaking: "💥",  // emoji prepended to breaking change footer
  issues: "🏁",    // emoji prepended to issue references
}
```

> [!NOTE]
> Set the `GITZY_NO_EMOJI` environment variable or pass `--no-emoji` to disable all emojis. Precedence: `--no-emoji` flag > `GITZY_NO_EMOJI` env > `emoji.enabled` config.

### `issues`

Controls the issues prompt behavior.

```js
issues: {
  pattern: "github",  // "github" (default) or "jira"
  prefix: "closes",   // "close" | "closes" | "closed" | "fix" | "fixes" | "fixed" | "resolve" | "resolves" | "resolved"
  hint: "#123, #456, resolves #789, org/repo#100",
}
```

> [!TIP]
> Specify multiple issues separated by commas: `#123, #456`, or with keywords: `resolves #123, fixes #456`, or cross-repo: `org/repo#123`. Use `pattern: "jira"` for Jira-style keys like `PROJ-123`.

### `branch`

Controls branch name generation.

```js
branch: {
  pattern: "{type}/{scope}/{issue}-{subject}", // default
  separator: "/",    // word separator within each segment
  max: 60,           // max branch name length
  checkout: true,    // auto-checkout after creation
}
```

**Pattern tokens:** `{type}`, `{scope}`, `{issue}`, `{subject}` — any token that has no value is omitted along with its surrounding separators.

### `useCommitlintConfig`

When set to `true` in the resolved config (via `gitzy config --json`), gitzy automatically maps commitlint rules to gitzy config:

- `type-enum` → `types`
- `scope-enum` → `scopes`
- `header-max-length` → `header.max`
- `header-min-length` → `header.min`

To enable, gitzy auto-detects a local commitlint config file when no gitzy config is found.

## Node API

gitzy exports a public Node API from `gitzy` (resolves to `dist/api/index.mjs`):

```js
import {
  defineConfig,
  resolveConfig,
  getConfig,
  formatMessage,
  formatMessageResult,
  formatBranchName,
  commit,
  createBranch,
  slugify,
  init,
  builtinTypes,
  defaultBranchConfig,
  defaultResolvedConfig,
} from "gitzy";
```

### `getConfig() / resolveConfig(): Promise<ResolvedConfig>`

Loads and resolves the gitzy config (auto-detects gitzy or commitlint config). `getConfig` is an alias for `resolveConfig`.

### `formatMessage(config, parts, emojiEnabled?): string`

Formats a conventional commit message string from the given parts and resolved config.

```js
import { formatMessage, getConfig } from "gitzy";

const config = await getConfig();
const message = formatMessage(config, {
  type: "feat",
  scope: "ui",
  subject: "add dark mode",
  body: "",
  breaking: false,
  issues: [],
});
```

### `formatMessageResult(config, parts, emojiEnabled?): CommitResult`

Returns a structured result `{ message, header, body, footer, parts }` — useful for `--json` output or programmatic use.

### `commit(message, options?): Promise<{ committed: boolean, message: string }>`

Executes `git commit -m <message>` with optional `amend`, `noVerify`, `hook`, and `dryRun` options.

### `formatBranchName(parts, branchConfig): string`

Formats a branch name string from the given parts and branch config.

```js
import { formatBranchName, defaultBranchConfig } from "gitzy";

const name = formatBranchName(
  { type: "feat", scope: "ui", subject: "add dark mode" },
  defaultBranchConfig,
);
// → "feat/ui/add-dark-mode"
```

### `createBranch(branchName, checkout?, dryRun?, from?): Promise<{ branchName: string }>`

Creates a new git branch, optionally checking it out. Pass `from` to create from a specific base branch or ref.

### `init(cwd?, options?): InitResult`

Generates a starter `.gitzyrc.json` in the given directory. Pass `{ force: true }` to overwrite an existing file.

### `defineConfig(config): Config`

Helper for typed config with editor autocomplete. No-op at runtime.

## Credits

- [git-cz](https://github.com/streamich/git-cz) by [streamich](https://github.com/streamich)

[actions-badge]: https://img.shields.io/github/actions/workflow/status/jimmy-guzman/gitzy/release.yml?branch=main&style=flat-square&logo=github
[version-badge]: https://img.shields.io/npm/v/gitzy?style=flat-square&logo=npm
[package]: https://www.npmjs.com/package/gitzy
[downloads-badge]: https://img.shields.io/npm/dm/gitzy?style=flat-square&logo=npm
[npmtrends]: https://www.npmtrends.com/gitzy
[license]: https://github.com/jimmy-guzman/gitzy/blob/master/LICENSE
[license-badge]: https://img.shields.io/github/license/jimmy-guzman/gitzy?style=flat-square&logo=open-source-initiative
[conventional-commits]: https://www.conventionalcommits.org/
[coverage-badge]: https://img.shields.io/codecov/c/github/jimmy-guzman/gitzy?style=flat-square&logo=codecov
[coverage]: https://codecov.io/github/jimmy-guzman/gitzy
[packagephobia]: https://packagephobia.com/result?p=gitzy
[install-size-badge]: https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json%3Fp=gitzy&query=$.install.pretty&label=install%20size&style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDggMTA4Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwNjgzOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzMyZGU4NSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0yMS42NjcgNzMuODA5VjMzLjg2N2wyOC4zMy0xNi4xODggMjguMzM3IDE2LjE4OFY2Ni4xM0w0OS45OTcgODIuMzIxIDM1IDczLjc1VjQxLjYwNGwxNC45OTctOC41N0w2NSA0MS42MDR2MTYuNzg4bC0xNS4wMDMgOC41NzEtMS42NjMtLjk1di0xNi42NzJsOC4zODItNC43OTItNi43MTktMy44MzgtOC4zMyA0Ljc2M1Y2OS44OGw4LjMzIDQuNzYyIDIxLjY3LTEyLjM4M1YzNy43MzdsLTIxLjY3LTEyLjM3OS0yMS42NjMgMTIuMzc5djM5Ljg4TDQ5Ljk5NyA5MCA4NSA3MFYzMEw0OS45OTcgMTAgMTUgMzB2NDB6Ii8+PC9zdmc+
