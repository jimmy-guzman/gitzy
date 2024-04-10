import type { Flags } from "./interfaces";

interface Lang {
  description: string;
  examples: string;
  flags: Record<keyof Omit<Flags, "emoji" | "help" | "version">, string>;
}

const skipQuestionMessage = (question: string): string => {
  return `skip "${question}" question and provide your own "${question}" message`;
};

export const lang: Lang = {
  description: "interactive conventional commits cli",
  examples: `
  $ gitzy
  $ gitzy -p -a
  $ gitzy -m "added cool new feature" -t "feat" -s "amazing"
  $ gitzy -lD --no-emoji
  `,
  flags: {
    get body(): string {
      return skipQuestionMessage("body");
    },
    get breaking(): string {
      return skipQuestionMessage("breaking");
    },
    commitlint: "leverage commitlint's configuration",
    get dryRun(): string {
      return "displays git message but does not commit";
    },
    get issues(): string {
      return skipQuestionMessage("issues");
    },
    noEmoji: "disable all emojis",
    passthrough: 'subsequent command line args passed through to "git"',
    retry: "retries previous commit, skips all prompts",
    get scope(): string {
      return skipQuestionMessage("scope");
    },
    skip: "skip questions",
    get subject(): string {
      return skipQuestionMessage("subject");
    },
    get type(): string {
      return skipQuestionMessage("type");
    },
  },
};
