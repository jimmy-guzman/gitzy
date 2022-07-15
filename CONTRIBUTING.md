# Getting Started

## Fork and Clone

[Github Cli](https://cli.github.com/manual/gh_repo_fork)

```bash
gh repo fork jimmy-guzman/gitzy --clone
```

or [traditional fork a repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)

## Install

Use either `nvm` or `volta` to be in sync with node version

- with [volta](https://volta.sh/) _(recommended)_

```bash
curl https://get.volta.sh | bash
```

```bash
pnpm install
```

- with [nvm](https://github.com/nvm-sh/nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```

```bash
nvm use && pnpm
```

## Scripts

Run build and typechecking in watch mode

```bash
pnpm dev
```

Run tests in watch mode

```bash
pnpm test:watch
```

Run commit cli

```bash
pnpm cz
```
