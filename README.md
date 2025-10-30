# gitzy 🪄

> Interactive [conventional commits][conventional-commits] CLI, inspired by [git-cz][git-cz], with support for [commitlint](https://commitlint.js.org/#/) configuration, validation, and flexible setup. See [features](#features).

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img width="750" src="./assets/demo.cast.svg" alt="Gitzy CLI screenshot"><br>
  <sub>Recorded with <a href="https://github.com/MrMarble/termsvg">termsvg</a> (glyphs look better IRL)</sub>
</p>
<!-- markdownlint-enable MD033 -->

![actions][actions-badge]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![License][license-badge]][license]
[![semantic-release][semantic-release-badge]][semantic-release]
[![code style: prettier][prettier-badge]][prettier]
[![Code Coverage][coverage-badge]][coverage]

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
- [Flags](#flags)

## Features

- Partial commitlint configuration support
- Config validation
- Multiple breaking-change formats (`!`, `footer`, `both`)
- Flexible emoji control
- Customizable type descriptions and emojis
- Dynamic scopes and types
- Friendly multiple issues support
- Retry (`--retry`) and dry-run (`--dry-run`) modes
- Git passthrough and hook support
- Flexible config discovery (`package.json`, `.gitzyrc.*`, `.config/`)
- ⚡ [Lightweight (~300 kB install, ~260 kB publish)](https://packagephobia.com/result?p=gitzy)

## Usage

```sh-session
npx gitzy
# or
npm install -g gitzy
gitzy
gitzy -p -a
gitzy -m "added cool new feature" -t "feat" -s "amazing"
gitzy -lD --no-emoji
```

## Configuration

By default, `gitzy` works out of the box and supports multiple configuration methods.

You can use a `gitzy` object in your `package.json`, or one of the following files:
`.gitzyrc`, `.gitzyrc.json`, `.gitzyrc.yaml`, `.gitzyrc.yml`, `.gitzyrc.js`, `.gitzyrc.cjs`, `gitzy.config.js`, `gitzy.config.cjs`, `.gitzyrc.mjs`, or `gitzy.config.mjs`.

> [!NOTE]
> All of these files can also live under a `.config/` directory.

## Options

The following configuration options are supported:

- [breakingChangeEmoji](#breakingchangeemoji)
- [breakingChangeFormat](#breakingchangeformat)
- [closedIssueEmoji](#closedissueemoji)
- [issuesHint](#issueshint)
- [issuesPrefix](#issuesprefix)
- [disableEmoji](#disableemoji)
- [details](#details)
- [headerMaxLength](#headermaxlength)
- [headerMinLength](#headerminlength)
- [questions](#questions)
- [scopes](#scopes)
- [types](#types)
- [useCommitlintConfig](#usecommitlintconfig)

### breakingChangeEmoji

```sh
feat: ✨ dope new feature

BREAKING CHANGE: 💥 breaks stuff
```

```yml
breakingChangeEmoji: "💥"
```

### breakingChangeFormat

Allows you to customize the format of the breaking change indicator and prompt behavior.

- `!` - Append `!` to the type/scope in the header and simply ask whether the change is a breaking change
- `footer` - Prompt for a description and add a `BREAKING CHANGE` footer (default)
- `both` - Prompt for a description and add both an indicator (`!`) and a footer

#### Examples

```sh
# "!" format - adds ! to header, prompts for yes/no
feat!: send an email to the customer when a product is shipped

# "footer" format - prompts for description, adds to footer
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files

# "both" format - adds ! to header AND prompts for footer description
chore!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```

```yml
breakingChangeFormat: "footer"
# Options: "!", "footer", or "both"
```

### closedIssueEmoji

```sh
fix: 🐛 resolved nasty bug

🏁 Closes #123
```

```yml
closedIssueEmoji: "🏁"
```

### issuesHint

Allows you to customize the `issues` prompt hint.

```yml
issuesHint: "#123, #456, resolves #789, org/repo#100"
```

### issuesPrefix

Allows you to choose the `issuesPrefix` based on [GitHub supported keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

```yml
issuesPrefix: closes # must be one of close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved
```

> [!TIP]
> Specify multiple issues separated by commas: `#123, #456`, or with keywords: `resolves #123, fixes #456`, or cross-repo: `org/repo#123`.

### disableEmoji

Disables all emojis; overrides `breakingChangeEmoji`, `closedIssueEmoji`, and `emoji` options.

```yml
disableEmoji: false
```

### details

Allows you to configure CLI and git message output by `type`.
_Default emojis follow standards set by [gitmoji][gitmoji], except for refactor due to its narrower rendering in most terminals._

> [!CAUTION]
> Emoji rendering varies by terminal. Some emojis (like ♻️) may cause alignment issues. Test custom emojis in your terminal before committing to them.

```yml
details:
  chore:
    description: Other changes that don't modify src or test files
    emoji: "🤖"
  ci:
    description: Changes to CI configuration files and scripts
    emoji: "👷"
  docs:
    description: Add or update documentation.
    emoji: "📝"
  feat:
    description: A new feature
    emoji: "✨"
  fix:
    description: Fix a bug.
    emoji: "🐛"
  perf:
    description: Improve performance.
    emoji: "⚡️"
  refactor:
    description: Refactor code.
    emoji: "🔄"
  release:
    description: Deploy stuff.
    emoji: "🚀"
  revert:
    description: Revert changes.
    emoji: "⏪"
  style:
    description: Improve structure/format of the code.
    emoji: "🎨"
  test:
    description: Add or update tests.
    emoji: "✅"
```

### headerMaxLength

```yml
headerMaxLength: 64
```

### headerMinLength

```yml
headerMinLength: 3
```

### questions

Allows you to toggle questions.

```yml
questions:
  - type # Choose the type
  - scope # Choose the scope
  - subject # Add a short description
  - body # Add a longer description
  - breaking # Add a short description
  - issues # Add issues this commit closes, e.g. #123
```

_`scope` question will not be shown if no scopes are provided._

### scopes

Allows you to provide a list of `scopes` to choose from.

```yml
scopes: []
```

_Will enable the `scope` question if scopes are provided._

### types

Allows you to provide a list of `types` to choose from. Further configurable via `details`.

```yml
types:
  - chore
  - docs
  - feat
  - fix
  - refactor
  - test
  - style
  - ci
  - perf
  - revert
  - release
```

### useCommitlintConfig

If enabled, uses [Commitlint configuration](https://commitlint.js.org/reference/configuration) for:

- `types` → [`rules[type-enum][2]`](https://commitlint.js.org/reference/rules#type-enum)
- `scopes` → [`rules[scope-enum][2]`](https://commitlint.js.org/reference/rules#scope-enum)
- `headerMaxLength` → [`rules[header-max-length][2]`](https://commitlint.js.org/reference/rules#header-max-length)
- `headerMinLength` → [`rules[header-min-length][2]`](https://commitlint.js.org/reference/rules#header-min-length)

```yml
useCommitlintConfig: false
```

## Flags

| Flag                       | Alias | Description                                                                           |
| -------------------------- | ----- | ------------------------------------------------------------------------------------- |
| `--version`                | `-v`  | output the version number                                                             |
| `--body <body>`            | `-d`  | set body inline                                                                       |
| `--breaking [breaking]`    | `-b`  | mark as breaking; add message for "footer"/"both" formats, or the flag for "!" format |
| `--dry-run`                | `-D`  | show commit message without committing                                                |
| `--issues <body>`          | `-i`  | set issues inline                                                                     |
| `--passthrough <flags...>` | `-p`  | pass remaining arguments to git (e.g. after `--`)                                     |
| `--scope <scope>`          | `-s`  | set scope inline                                                                      |
| `--subject <message>`      | `-m`  | set subject inline                                                                    |
| `--type <type>`            | `-t`  | set type inline                                                                       |
| `--commitlint`             | `-l`  | leverage local commitlint config                                                      |
| `--retry`                  | `-r`  | retry last commit and skip prompts                                                    |
| `--no-emoji`               |       | disable all emojis                                                                    |
| `--hook`                   | `-H`  | enable running inside a git hook (e.g. pre-commit)                                    |
| `--skip <questions...>`    | `-S`  | skip prompts (choices: "type", "scope", "subject", "body", "breaking", "issues")      |
| `--help`                   | `-h`  | display help for command                                                              |

---

[actions-badge]: https://img.shields.io/github/actions/workflow/status/jimmy-guzman/gitzy/release.yml?style=flat-square&logo=github-actions
[version-badge]: https://img.shields.io/npm/v/gitzy.svg?logo=npm&style=flat-square
[package]: https://www.npmjs.com/package/gitzy
[downloads-badge]: https://img.shields.io/npm/dm/gitzy.svg?logo=npm&style=flat-square
[npmtrends]: https://www.npmtrends.com/gitzy
[semantic-release]: https://github.com/semantic-release/semantic-release
[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square&logo=prettier
[prettier]: https://github.com/prettier/prettier
[gitmoji]: https://gitmoji.carloscuesta.me/
[license]: https://github.com/jimmy-guzman/gitzy/blob/master/LICENSE
[license-badge]: https://img.shields.io/npm/l/gitzy.svg?style=flat-square
[conventional-commits]: https://www.conventionalcommits.org/
[git-cz]: https://github.com/streamich/git-cz
[coverage-badge]: https://img.shields.io/codecov/c/github/jimmy-guzman/gitzy.svg?style=flat-square&logo=codecov
[coverage]: https://codecov.io/github/jimmy-guzman/gitzy
