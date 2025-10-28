# Getting Started

## Fork and Clone

[Github Cli](https://cli.github.com/manual/gh_repo_fork)

```bash
gh repo fork jimmy-guzman/gitzy --clone
```

or [traditional fork a repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)

## Install

Make sure you're using the correct Node.js version

```bash
pnpm install
```

## Scripts

Run tests in watch mode

```bash
pnpm test
```

Run all checks (build, knip, lint, format, coverage, typecheck)

```bash
pnpm check
```

Run the commit CLI

```bash
pnpm gitzy
```

Fix formatting issues

```bash
pnpm format:fix
```

Fix linting issues

```bash
pnpm lint:fix
```

Run tests with coverage

```bash
pnpm coverage
```
