![actions][actions-badge]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![License][license-badge]][license]
[![semantic-release][semantic-release-badge]][semantic-release]
[![code style: prettier][prettier-badge]][prettier]

# gitzy🪄

interactive [conventional commits][conventional-commits] cli, inspired by [git-cz][git-cz] with the ability to leverage [commitlint](https://commitlint.js.org/#/) configuration, configuration validation, versatile configuration through [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) and more.

<p align="center">
  <img width="750" src="https://jimmy-guzman.github.io/gitzy/assets/cli.svg">
</p>

<!-- toc -->

- [Usage](#usage)
- [Configuration](#configuration)
- [Flags](#flags)
<!-- tocstop -->

# Usage

## Quick start

```sh-session
$ npx gitzy
```

## Getting Started

<!-- usage -->

```sh-session
$ npm install -g gitzy
$ gitzy
$ gitzy -p -a
$ gitzy -m "added cool new feature" -t "feat" -s "amazing"
$ gitzy -lD --no-emoji
```

<!-- usagestop -->

# Configuration

By default `gitzy` comes ready to run out of the box.

> This supports cosmiconfig, so you can customize with either a `gitzy` key in your package.json, or just create a `.gitzyrc.json`, `.gitzyrc.yml`, `gitzy.config.js`, etc. in your project or `.config/` directory.

## Options

- [breakingChangeEmoji](###breakingChangeEmoji)
- [closedIssueEmoji](###closedIssueEmoji)
- [issuesPrefix](###issuesPrefix)
- [disableEmoji](###disableEmoji)
- [details](###details)
- [headerMaxLength](###headerMaxLength)
- [headerMinLength](###headerMinLength)
- [questions](###questions)
- [scopes](###scopes)
- [types](###types)
- [useCommitlintConfig](###useCommitlintConfig)

### breakingChangeEmoji

```
feat: 🎸 dope new feature

BREAKING CHANGE: 🧨 breaks stuff
```

```yml
breakingChangeEmoji: '🧨'
```

### closedIssueEmoji

```
fix: 🐛 resolved nasty bug

🏁 Closes: #123
```

```yml
closedIssueEmoji: '🏁'
```

### issuesPrefix

Allows you to choose the `issuesPrefix` based on [Github supported keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

```yml
issuesPrefix: closes # must be one of close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved
```

### disableEmoji

Disable all emojis, overrides `breakingChangeEmoji`, `closedIssueEmoji` and `emoji` options

```yml
disableEmoji: false
```

### details

Allows you to further configure cli and git message output based on `type`.
_Default emojis follow standards set by [gitmoji][gitmoji]_

```yml
details:
  chore:
    description: Other changes that don't modify src or test files
    emoji: '🤖'
  ci:
    description: Changes to CI configuration files and scripts
    emoji: '👷'
  docs:
    description: Add or update documentation.
    emoji: '📝'
  feat:
    description: A new feature
    emoji: '🎸'
  fix:
    description: Fix a bug.
    emoji: '🐛'
  perf:
    description: Improve performance.
    emoji: '⚡️'
  refactor:
    description: Refactor code.
    emoji: '♻️'
  release:
    description: Deploy stuff.
    emoji: '🚀'
  revert:
    description: Revert changes.
    emoji: '⏪'
  style:
    description: Improve structure / format of the code.
    emoji: '🎨'
  test:
    description: Add or update tests.
    emoji: '✅'
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
  - issues # Add issues this commit closes, e.g #123
```

_`scope` question will not be turned if there's no scopes_

### scopes

Allows you to provide list of `scopes` to choose from.

```yml
scopes: []
```

_Will enable `scope` question if scopes are provided._

### types

Allows you to provide list of `types` to choose from. Can be further configured through `Details`.

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

Will leverage [Commitlint's configuration](https://commitlint.js.org/#/reference-configuration) instead for these options:

- `types` correlates to [`rules[type-enum][2]`](https://commitlint.js.org/#/reference-rules?id=type-enum)
- `scopes` correlates to [`rules[scope-enum][2]`](https://commitlint.js.org/#/reference-rules?id=scope-enum)
- `headerMaxLength` correlates to [`rules[header-max-length][2]`](https://commitlint.js.org/#/reference-rules?id=header-max-length)
- `headerMinLength` correlates to [`rules[header-min-length][2]`](https://commitlint.js.org/#/reference-rules?id=header-min-length)

```yml
useCommitlintConfig: false
```

# Flags

| flag            | alias | description                                                      |
| --------------- | ----- | ---------------------------------------------------------------- |
| `--breaking`    | `-b`  | skip "breaking" question and provide your own "breaking" message |
| `--body`        | `-d`  | skip "body" question and provide your own "body" message         |
| `--help`        | `-h`  | display help for command                                         |
| `--issues`      | `-i`  | skip "issues" question and provide your own "issue" message      |
| `--subject`     | `-m`  | skip "subject" question and provide your own "subject" message   |
| `--passthrough` | `-p`  | subsequent command line args passed through to `git`             |
| `--scope`       | `-s`  | skip "scope" question and provide your own "scope" message       |
| `--type`        | `-t`  | skip "type" question and provide your own "type" message         |
| `--dry-run`     | `-D`  | output the git message but do not commit                         |
| `--version`     | `-v`  | output the version number                                        |
| `--commitlint`  | `-l`  | leverage commitlint's configuration                              |
| `--no-emoji`    |       | disable all emojis                                               |

<!-- references -->

[actions-badge]: https://img.shields.io/github/workflow/status/jimmy-guzman/gitzy/release?label=actions&logo=github-actions&style=flat-square
[version-badge]: https://img.shields.io/npm/v/gitzy.svg?logo=npm&style=flat-square
[package]: https://www.npmjs.com/package/gitzy
[downloads-badge]: https://img.shields.io/npm/dm/gitzy.svg?logo=npm&style=flat-square
[npmtrends]: http://www.npmtrends.com/gitzy
[semantic-release]: https://github.com/semantic-release/semantic-release
[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[prettier]: https://github.com/prettier/prettier
[gitmoji]: https://gitmoji.carloscuesta.me/
[license]: https://github.com/jimmy-guzman/gitzy/blob/master/package.json
[license-badge]: https://img.shields.io/npm/l/gitzy.svg?style=flat-square
[conventional-commits]: https://www.conventionalcommits.org/
[git-cz]: https://github.com/streamich/git-cz
