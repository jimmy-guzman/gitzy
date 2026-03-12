import type { BranchFlags, CommitFlags, GlobalFlags } from "@/cli/types";

type CommitFlagDescriptions = Record<keyof Omit<CommitFlags, "emoji">, string>;

type BranchFlagDescriptions = Record<keyof BranchFlags, string>;

type GlobalFlagDescriptions = Record<keyof GlobalFlags, string>;

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
  globalFlags: GlobalFlagDescriptions;
}

export const lang = {
  branch: {
    description: "generate a branch name from a conventional commit prompt",
    examples: `
  $ gitzy branch
  $ gitzy branch --type feat -m "add dark mode" --scope ui
  $ gitzy branch --amend
  $ gitzy branch --dry-run
    `,
    flags: {
      amend: "rename the current branch instead of creating a new one",
      checkout: "checkout the new branch after creating it",
      dryRun: "show branch name without creating it",
      from: "create the branch from a base branch",
      issue: "set issue reference inline (e.g. #42 or PROJ-123)",
      json: "output result as JSON",
      scope: "set scope inline",
      stdin: "read answers from stdin as JSON",
      subject: "set subject inline",
      type: "set type inline",
    },
  },
  commit: {
    description: "create a conventional commit (default command)",
    examples: `
  $ gitzy
  $ gitzy commit
  $ gitzy commit --type feat -m "add dark mode"
  $ gitzy commit --amend
  $ gitzy commit --dry-run
    `,
    flags: {
      amend: "amend the previous commit",
      body: "set body inline",
      breaking:
        'mark as breaking; add message for "footer"/"both" formats, or the flag for "!" format',
      coAuthor: 'add co-authors (repeatable: --co-author "Name <email>")',
      dryRun: "show commit message without committing",
      hook: "enable running inside a git hook (e.g. pre-commit)",
      issue: "set issues inline (repeatable: --issue '#123' --issue '#456')",
      json: "output result as JSON",
      noEmoji: "disable emoji in commit message",
      noVerify: "skip git hooks (--no-verify)",
      retry: "retry last commit and skip prompts",
      scope: "set scope inline",
      stdin: "read answers from stdin as JSON",
      subject: "set subject inline",
      type: "set type inline",
    },
  },
  description: "interactive conventional commits cli",
  globalFlags: {
    json: "output result as JSON",
  },
} satisfies Lang;
