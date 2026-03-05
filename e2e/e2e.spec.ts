import { execSync } from "node:child_process";

/** ESC character — built dynamically to avoid no-control-regex lint errors */
const ESC = String.fromCodePoint(0x1b);
const ANSI_RE = new RegExp(String.raw`${ESC}\[[0-9;]*[mhHlJ]`, "gu");
const CURSOR_RE = new RegExp(String.raw`${ESC}\[\?25[lh]`, "gu");

const stripAnsi = (s: string) => {
  return s.replaceAll(ANSI_RE, "").replaceAll(CURSOR_RE, "");
};

interface CommitPayload {
  body: string;
  breaking: boolean | string;
  coAuthors: string[];
  issues: string[];
  scope: string;
  subject: string;
  type: string;
}

interface BranchPayload {
  issue: string;
  scope: string;
  subject: string;
  type: string;
}

const defaultCommitPayload = (): CommitPayload => {
  return {
    body: "",
    breaking: false,
    coAuthors: [],
    issues: [],
    scope: "",
    subject: "testing",
    type: "chore",
  };
};

const defaultBranchPayload = (): BranchPayload => {
  return {
    issue: "",
    scope: "",
    subject: "add dark mode",
    type: "feat",
  };
};

const runCommit = (args: string, stdin?: string) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const input = stdin ? Buffer.from(stdin) : undefined;

      const raw = execSync(`node ./dist/run.mjs commit --dry-run ${args}`, {
        input,
      }).toString("utf8");

      const clean = stripAnsi(raw);

      const marker = "Message...\n\n";
      const start = clean.indexOf(marker);

      if (start === -1) {
        reject(new Error(`Could not find message marker in output:\n${clean}`));

        return;
      }

      const message = clean.slice(start + marker.length).trim();

      resolve(message);
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
};

const runBranch = (args: string, stdin?: string) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const input = stdin ? Buffer.from(stdin) : undefined;

      const raw = execSync(`node ./dist/run.mjs branch --dry-run ${args}`, {
        input,
      }).toString("utf8");

      const clean = stripAnsi(raw);

      const match = /Branch name: (.+)/.exec(clean);

      if (!match) {
        reject(new Error(`Could not find branch name in output:\n${clean}`));

        return;
      }

      resolve(match[1].trim());
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
};

describe("gitzy", () => {
  describe("commit", () => {
    it("should create commit message with all fields", async () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        body: "some longer description",
        breaking: "this broke something",
        issues: ["#123"],
        scope: "e2e",
      });

      const result = await runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`
        "chore(e2e): 🤖 testing

        some longer description

        BREAKING CHANGE: 💥 this broke something

        🏁 Closes #123"
      `);
    });

    it("should create commit message with type, scope, subject and issues", async () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        issues: ["#123"],
        scope: "e2e",
      });

      const result = await runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`
        "chore(e2e): 🤖 testing

        🏁 Closes #123"
      `);
    });

    it("should create commit message with type, scope, subject and body", async () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        body: "some longer description",
        scope: "e2e",
      });

      const result = await runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`
        "chore(e2e): 🤖 testing

        some longer description"
      `);
    });

    it("should create commit message with type, scope and subject", async () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        scope: "e2e",
      });

      const result = await runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"chore(e2e): 🤖 testing"`);
    });

    it("should create commit message with type and subject only", async () => {
      const stdin = JSON.stringify(defaultCommitPayload());

      const result = await runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
    });

    it("should NOT add '!' when breaking is true and format is footer", async () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        breaking: true,
      });

      const result = await runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
    });

    it("should respect inline flags over stdin", async () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        subject: "from stdin",
        type: "docs",
      });

      const result = await runCommit("-t feat -m override --stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"feat: ✨ override"`);
    });

    it("should add co-authors to commit message", async () => {
      const stdin = JSON.stringify(defaultCommitPayload());

      const result = await runCommit(
        '--stdin --co-author "Alice <alice@example.com>"',
        stdin,
      );

      expect(result).toMatchInlineSnapshot(`
        "chore: 🤖 testing

        Co-authored-by: Alice <alice@example.com>"
      `);
    });

    it("should skip prompts when --type and --subject are provided as flags", async () => {
      const result = await runCommit("-t feat -m add-endpoint");

      expect(result).toMatchInlineSnapshot(`"feat: ✨ add-endpoint"`);
    });

    it("should skip prompts and include scope when --type, --scope, and --subject are provided", async () => {
      const result = await runCommit("-t feat -s api -m add-endpoint");

      expect(result).toMatchInlineSnapshot(`"feat(api): ✨ add-endpoint"`);
    });

    it("should skip prompts and include issue when --type, --subject, and --issue are provided", async () => {
      const result = await runCommit("-t fix -m fix-bug -i '#123'");

      expect(result).toMatchInlineSnapshot(`
        "fix: 🐛 fix-bug

        🏁 Closes #123"
      `);
    });

    it("should skip prompts and include co-author when --type, --subject, and --co-author are provided", async () => {
      const result = await runCommit(
        '-t feat -m add-endpoint -c "Alice <alice@example.com>"',
      );

      expect(result).toMatchInlineSnapshot(`
        "feat: ✨ add-endpoint

        Co-authored-by: Alice <alice@example.com>"
      `);
    });
  });

  describe("branch", () => {
    it("should format a branch name with type, scope and subject", async () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        scope: "ui",
      });

      const result = await runBranch("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"feat/ui/add/dark/mode"`);
    });

    it("should format a branch name with type and subject only", async () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        subject: "fix login bug",
        type: "fix",
      });

      const result = await runBranch("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"fix/fix/login/bug"`);
    });

    it("should include issue reference in branch name", async () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        issue: "PROJ-123",
        subject: "add feature",
      });

      const result = await runBranch("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"feat/PROJ-123-add/feature"`);
    });

    it("should format a branch name with --from flag", async () => {
      const stdin = JSON.stringify(defaultBranchPayload());

      const result = await runBranch("--stdin --from main", stdin);

      expect(result).toMatchInlineSnapshot(`"feat/add/dark/mode"`);
    });

    it("should skip prompts when --type and --subject are provided as flags", async () => {
      const result = await runBranch("-t feat -m add-dark-mode");

      expect(result).toMatchInlineSnapshot(`"feat/add/dark/mode"`);
    });

    it("should skip prompts and include scope when --type, --scope, and --subject are provided", async () => {
      const result = await runBranch("-t feat -s ui -m add-dark-mode");

      expect(result).toMatchInlineSnapshot(`"feat/ui/add/dark/mode"`);
    });
  });
});
