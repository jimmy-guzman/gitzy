import type { BranchFlags, CommitFlags, GlobalFlags } from "@/cli/types";

type CommitFlagDescriptions = Record<
  keyof Omit<CommitFlags, "emoji" | "hook" | "stdin">,
  string
>;

type BranchFlagDescriptions = Record<keyof Omit<BranchFlags, "stdin">, string>;

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
  $ gitzy branch -t feat -m "add dark mode" -s ui
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
      subject: "set subject inline",
      type: "set type inline",
    },
  },
  commit: {
    description: "create a conventional commit (default command)",
    examples: `
  $ gitzy
  $ gitzy commit
  $ gitzy commit -t feat -m "add dark mode"
  $ gitzy commit --amend
  $ gitzy commit --dry-run
    `,
    flags: {
      amend: "amend the previous commit",
      body: "set body inline",
      breaking:
        'mark as breaking; add message for "footer"/"both" formats, or the flag for "!" format',
      coAuthor: 'add co-authors (repeatable: -c "Name <email>")',
      dryRun: "show commit message without committing",
      issue: "set issues inline (repeatable: -i '#123' -i '#456')",
      json: "output result as JSON",
      noEmoji: "disable emoji in commit message",
      noVerify: "skip git hooks (--no-verify)",
      retry: "retry last commit and skip prompts",
      scope: "set scope inline",
      subject: "set subject inline",
      type: "set type inline",
    },
  },
  description: "interactive conventional commits cli",
  globalFlags: {
    json: "output result as JSON",
  },
} satisfies Lang;
