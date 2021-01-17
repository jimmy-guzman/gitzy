![actions][actions-badge]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![License][license-badge]][license]
[![semantic-release][semantic-release-badge]][semantic-release]
[![code style: prettier][prettier-badge]][prettier]

<h1>gitzy🪄</h1>

interactive [conventional commits][conventional-commits] cli, inspired by [git-cz][git-cz] with the ability to leverage `commitlint` configuration, configuration validation, versatile configuration through `cosmiconfig` and more

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
$ gitzy COMMAND
running command...
$ gitzy (-v|--version|version)
gitzy/0.0.0 darwin-x64 node-v14.15.4
$ gitzy --help [COMMAND]
USAGE
  $ gitzy COMMAND
...
```

<!-- usagestop -->

# Configuration

By default `gitzy` comes ready to run out of the box.

> This supports cosmiconfig, so you can customize with either a `gitzy` key in your package.json, or just create a `.gitzyrc.json`, `.gitzyrc.yml`, `gitzy.config.js`, etc. in your project directory.

## Options

### Breaking Change Emoji

```
feat: 🎸 dope new feature

BREAKING CHANGE: 🧨 breaks stuff
```

```yml
breakingChangeEmoji: '🧨'
```

### Closed Issues Emoji

```
fix: 🐛 resolved nasty bug

🏁 Closes: #123
```

```yml
closedIssueEmoji: '🏁'
```

### Disable Emoji

Disable all emojis, overrides `breakingChangeEmoji`, `closedIssueEmoji` and `emoji` options

```yml
disableEmoji: false
```

### Details

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

### Max Message Length

```yml
maxMessageLength: 64
```

### Min Message Length

```yml
minMessageLength: 3
```

### Questions

Allows you to toggle questions.

```yml
questions:
  - type # Select the kind of change
  - scope # Select the context of the change
  - subject # Give a short description of the change
  - body # Give a longer description of the change
  - breaking # List any breaking changes
  - issues # Issues this commit closes, e.g #123
```

_`scope` question will not be turned if there's no scopes_

### Scopes

Allows you to provide list of `scopes` to choose from.

```yml
scopes: []
```

_Will enable `scope` question if scopes are provided._

### Types

Allows you to provide list of `types` to choose from. Can be further configured through `Details`.

```yml
types:
  - chore
  - docs
  - feat
  - fix
  - refactor
  - test
```

### issuesPrefix

Allows you to choose the `issuesPrefix` based on [Github supported keywords](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

```yml
issuesPrefix: closes # must be one of close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved
```

### Commitlint

Will leverage [Commitlint's configuration](https://commitlint.js.org/#/reference-configuration) instead for these options:

- `types` correlates to [`rules[type-enum][2]`](https://commitlint.js.org/#/reference-rules?id=type-enum)
- `scopes` correlates to [`rules[scope-enum][2]`](https://commitlint.js.org/#/reference-rules?id=scope-enum)
- `maxMessageLength` correlates to [`rules[header-max-length][2]`](https://commitlint.js.org/#/reference-rules?id=header-max-length)
- `minMessageLength` correlates to [`rules[header-min-length][2]`](https://commitlint.js.org/#/reference-rules?id=header-min-length)

```yml
useCommitlintConfig: false
```

# Flags

| flag            | alias | description                                                      |
| --------------- | ----- | ---------------------------------------------------------------- |
| `--breaking`    | `-b`  | skip "breaking" question and provide your own "breaking" message |
| `--body`        | `-d`  | skip "body" question and provide your own "body" message         |
| `--help`        | `-h`  | show CLI help                                                    |
| `--issues`      | `-i`  | skip "issues" question and provide your own "issue" message      |
| `--subject`     | `-m`  | skip "subject" question and provide your own "subject" message   |
| `--passThrough` | `-p`  | subsequent command line args passed through to "git"             |
| `--scope`       | `-s`  | skip "scope" question and provide your own "scope" message       |
| `--type`        | `-t`  | skip "type" question and provide your own "type" message         |
| `--dry-run`     | `-D`  | displays git message but does not commit                         |

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
