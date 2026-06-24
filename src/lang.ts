import type { BranchFlags, CommitFlags } from "@/cli/types";

type CommitFlagDescriptions = Record<keyof Omit<CommitFlags, "emoji">, string>;

type BranchFlagDescriptions = Record<keyof BranchFlags, string>;

interface Lang {
  branch: {
    description: string;
    examples: string;
    flags: BranchFlagDescriptions;
  };
  commit: {
    description: string;
    examples: string;
    flags: CommitFlagDescriptions;
  };
  description: string;
}

export const lang = {
  branch: {
    description: "Generate a branch name from a conventional commit prompt",
    examples: `
  $ gitzy branch
  $ gitzy branch --type feat -m "add dark mode"
  $ gitzy branch --type feat --scope ui -m "add dark mode"
  $ gitzy branch --type feat -m "add dark mode" --issue "PROJ-123"
  $ gitzy branch --type feat -m "add dark mode" --dry-run
  $ gitzy branch --amend
  $ gitzy branch --from main --type feat -m "add dark mode"
    `,
    flags: {
      amend: "Rename the current branch instead of creating a new one",
      checkout: "Checkout the new branch after creating it",
      dryRun: "Show branch name without creating it",
      from: "Create the branch from a base branch",
      issue: "Set issue reference inline (e.g. #42 or PROJ-123)",
      json: "Output result as JSON",
      scope: "Set scope inline",
      stdin: "Read answers from stdin as JSON",
      subject: "Set subject inline",
      type: "Set type inline",
    },
  },
  commit: {
    description: "Create a conventional commit (default command)",
    examples: `
  $ gitzy
  $ gitzy commit
  $ gitzy commit --type feat -m "add dark mode"
  $ gitzy commit --type feat --scope ui -m "add dark mode"
  $ gitzy commit --type feat -m "add dark mode" --body "implemented via css variables"
  $ gitzy commit --type feat -m "add dark mode" --breaking "dark mode is now default"
  $ gitzy commit --type feat -m "add dark mode" --issue '#123' --issue '#456'
  $ gitzy commit --type feat -m "add dark mode" --co-author "Jane Doe <jane@example.com>"
  $ gitzy commit --type feat -m "add dark mode" --dry-run
  $ gitzy commit --type feat -m "add dark mode" --no-emoji
  $ gitzy commit --type feat -m "add dark mode" --signoff
  $ gitzy commit --amend
  $ gitzy commit --retry
    `,
    flags: {
      amend: "Amend the previous commit",
      body: "Set body inline",
      breaking:
        'Mark as breaking; add message for "footer"/"both" formats, or the flag for "!" format',
      coAuthor: 'Add co-authors (repeatable: --co-author "Name <email>")',
      dryRun: "Show commit message without committing",
      hook: "Enable running inside a git hook (e.g. pre-commit)",
      issue: "Set issues inline (repeatable: --issue '#123' --issue '#456')",
      json: "Output result as JSON",
      noEmoji: "Disable emoji in commit message",
      noVerify: "Skip git hooks (--no-verify)",
      retry: "Retry last commit and skip prompts",
      scope: "Set scope inline",
      signoff:
        'Add a Signed-off-by trailer; pass a "Name <email>" to override your git identity',
      stdin: "Read answers from stdin as JSON",
      subject: "Set subject inline",
      type: "Set type inline",
    },
  },
  description: "Conventional commits and branch CLI",
} satisfies Lang;
