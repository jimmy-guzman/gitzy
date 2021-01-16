interface Flags {
  passthrough: string
  subject: string
  scope: string
  body: string
  breaking: string
  dryRun: string
  issues: string
  type: string
}

interface Lang {
  examples: string
  description: string
  flags: Flags
}

const skipQuestionMessage = (question: string) =>
  `skip "${question}" question and provide your own "${question}" message`

export const lang: Lang = {
  examples: `
  $ gitzy
  $ gitzy -p --amend
  $ gitzy -m "added cool new feature" -t "feat" -s "amazing"
  `,
  description: 'interactive conventional commits cli',
  flags: {
    get body(): string {
      return skipQuestionMessage('body')
    },
    get breaking(): string {
      return skipQuestionMessage('breaking')
    },
    get dryRun(): string {
      return 'displays git message but does not commit'
    },
    get issues(): string {
      return skipQuestionMessage('issues')
    },
    passthrough: 'subsequent command line args passed through to "git"',
    get scope(): string {
      return skipQuestionMessage('scope')
    },
    get subject(): string {
      return skipQuestionMessage('subject')
    },
    get type(): string {
      return skipQuestionMessage('type')
    },
  },
}
