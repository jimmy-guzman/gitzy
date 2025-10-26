import type { Flags } from "./interfaces";

interface Lang {
  description: string;
  examples: string;
  flags: Record<keyof Omit<Flags, "emoji" | "help" | "version">, string>;
}

const skipQuestionMessage = (question: string) => {
  return `skip "${question}" question and provide your own "${question}" message`;
};

export const lang = {
  description: "interactive conventional commits cli",
  examples: `
  $ gitzy
  $ gitzy -p -a
  $ gitzy -m "added cool new feature" -t "feat" -s "amazing"
  $ gitzy -lD --no-emoji
  `,
  flags: {
    get body() {
      return skipQuestionMessage("body");
    },
    breaking:
      'mark as breaking change. Pass a message for "footer"/"both" formats, or just the flag for "!" format',
    commitlint: "leverage commitlint's configuration",
    get dryRun() {
      return "displays git message but does not commit";
    },
    hook: "run gitzy inside a Git hook",
    get issues() {
      return skipQuestionMessage("issues");
    },
    noEmoji: "disable all emojis",
    passthrough: 'subsequent command line args passed through to "git"',
    retry: "retries previous commit, skips all prompts",
    get scope() {
      return skipQuestionMessage("scope");
    },
    skip: "skip questions",
    get subject() {
      return skipQuestionMessage("subject");
    },
    get type() {
      return skipQuestionMessage("type");
    },
  },
} satisfies Lang;
