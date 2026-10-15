import { execSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Absolute path to the built binary — resolved once relative to this file */
const BIN = path.resolve(import.meta.dirname, "../dist/run.mjs");

/**
 * Isolated working directory for this e2e run — unique per process so
 * parallel test runs don't share state, and lives outside the repo so
 * lilconfig cannot walk up and find the project's own gitzy.config.js.
 */
const E2E_CWD = mkdtempSync(path.join(tmpdir(), "gitzy-e2e-"));

/** ESC character — built dynamically to avoid no-control-regex lint errors */
const ESC = String.fromCodePoint(0x1b);
const ANSI_RE = new RegExp(String.raw`${ESC}\[[0-9;?]*[A-Za-z@]`, "gu");
const CURSOR_RE = new RegExp(String.raw`${ESC}\[\?25[lh]`, "gu");

const stripAnsi = (s: string) =>
  s.replaceAll("\r\n", "\n").replaceAll(ANSI_RE, "").replaceAll(CURSOR_RE, "");

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

const defaultCommitPayload = (): CommitPayload => ({
  body: "",
  breaking: false,
  coAuthors: [],
  issues: [],
  scope: "",
  subject: "testing",
  type: "chore",
});

const defaultBranchPayload = (): BranchPayload => ({
  issue: "",
  scope: "",
  subject: "add dark mode",
  type: "feat",
});

const runCommit = (args: string, stdin?: string) => {
  const input = stdin === undefined ? undefined : Buffer.from(stdin);

  const raw = execSync(`node "${BIN}" commit --dry-run ${args}`, {
    cwd: E2E_CWD,
    encoding: "utf-8",
    env: { ...process.env, TEMP: E2E_CWD, TMP: E2E_CWD, TMPDIR: E2E_CWD },
    input,
    timeout: 30_000,
  });

  const clean = stripAnsi(raw);

  const marker = "Message...";
  const start = clean.indexOf(marker);

  if (start === -1) {
    throw new Error(`Could not find message marker in output:\n${clean}`);
  }

  const afterMarker = clean.slice(start + marker.length);

  return afterMarker
    .split("\n")
    .map((line) => line.replace(/^[│|]\s{0,2}/u, ""))
    .join("\n")
    .trim();
};

const run = (args: string[], cwd = E2E_CWD) =>
  spawnSync("node", [BIN, ...args], {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, TEMP: E2E_CWD, TMP: E2E_CWD, TMPDIR: E2E_CWD },
    timeout: 30_000,
  });

const runBranch = (args: string, stdin?: string) => {
  const input = stdin === undefined ? undefined : Buffer.from(stdin);

  const raw = execSync(`node "${BIN}" branch --dry-run ${args}`, {
    cwd: E2E_CWD,
    encoding: "utf-8",
    input,
    timeout: 30_000,
  });

  const clean = stripAnsi(raw);

  const match = /Branch name: (?<name>.+)/u.exec(clean);

  if (match?.groups?.name === undefined) {
    throw new Error(`Could not find branch name in output:\n${clean}`);
  }

  return match.groups.name.trim();
};

describe("gitzy", () => {
  afterAll(() => {
    rmSync(E2E_CWD, { force: true, recursive: true });
  });

  describe("commit", () => {
    it("should create commit message with all fields", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        body: "some longer description",
        breaking: "this broke something",
        issues: ["#123"],
        scope: "e2e",
      });

      const result = runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`
        "chore(e2e): 🤖 testing

        some longer description

        BREAKING CHANGE: 💥 this broke something

        🏁 Closes #123"
      `);
    });

    it("should create commit message with type, scope, subject and issues", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        issues: ["#123"],
        scope: "e2e",
      });

      const result = runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`
        "chore(e2e): 🤖 testing

        🏁 Closes #123"
      `);
    });

    it("should create commit message with type, scope, subject and body", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        body: "some longer description",
        scope: "e2e",
      });

      const result = runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`
        "chore(e2e): 🤖 testing

        some longer description"
      `);
    });

    it("should create commit message with type, scope and subject", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        scope: "e2e",
      });

      const result = runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"chore(e2e): 🤖 testing"`);
    });

    it("should create commit message with type and subject only", () => {
      const stdin = JSON.stringify(defaultCommitPayload());

      const result = runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
    });

    it("should NOT add '!' when breaking is true and format is footer", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        breaking: true,
      });

      const result = runCommit("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"chore: 🤖 testing"`);
    });

    it("should respect inline flags over stdin", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        subject: "from stdin",
        type: "docs",
      });

      const result = runCommit("--type feat -m override --stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"feat: ✨ override"`);
    });

    it("should add co-authors to commit message", () => {
      const stdin = JSON.stringify(defaultCommitPayload());

      const result = runCommit(
        '--stdin --co-author "Alice <alice@example.com>"',
        stdin
      );

      expect(result).toMatchInlineSnapshot(`
        "chore: 🤖 testing

        Co-authored-by: Alice <alice@example.com>"
      `);
    });

    it("should skip prompts when --type and --subject are provided as flags", () => {
      const result = runCommit("--type feat -m add-endpoint");

      expect(result).toMatchInlineSnapshot(`"feat: ✨ add-endpoint"`);
    });

    it("should skip prompts and include scope when --type, --scope, and --subject are provided", () => {
      const result = runCommit("--type feat --scope api -m add-endpoint");

      expect(result).toMatchInlineSnapshot(`"feat(api): ✨ add-endpoint"`);
    });

    it("should skip prompts and include issue when --type, --subject, and --issue are provided", () => {
      const result = runCommit("--type fix -m fix-bug --issue '#123'");

      expect(result).toMatchInlineSnapshot(`
        "fix: 🐛 fix-bug

        🏁 Closes #123"
      `);
    });

    it("should skip prompts and include co-author when --type, --subject, and --co-author are provided", () => {
      const result = runCommit(
        '--type feat -m add-endpoint --co-author "Alice <alice@example.com>"'
      );

      expect(result).toMatchInlineSnapshot(`
        "feat: ✨ add-endpoint

        Co-authored-by: Alice <alice@example.com>"
      `);
    });

    it("should add an explicit Signed-off-by override via --signoff", () => {
      const result = runCommit(
        '--type feat -m add-endpoint --signoff "Bot <bot@example.com>"'
      );

      expect(result).toMatchInlineSnapshot(`
        "feat: ✨ add-endpoint

        Signed-off-by: Bot <bot@example.com>"
      `);
    });

    it("should print the no TTY error on stderr only", () => {
      const { status, stderr, stdout } = run(["commit", "--dry-run"]);

      expect(status).toBe(1);
      expect(stdout).toBe("");
      expect(stderr).toContain("No TTY detected");
    });

    it("should print the no files staged error on stderr only", () => {
      const repo = mkdtempSync(path.join(E2E_CWD, "repo-"));

      execSync("git init -q", { cwd: repo });

      const { status, stderr, stdout } = run(
        ["commit", "--type", "feat", "-m", "hello there", "--json"],
        repo
      );

      expect(status).toBe(1);
      expect(stdout).toBe("");
      expect(stderr).toContain("No files staged");
    });

    it("should print only JSON on stdout with --dry-run --json", () => {
      const { status, stderr, stdout } = run([
        "commit",
        "--type",
        "feat",
        "-m",
        "hello there",
        "-D",
        "--json",
      ]);

      expect(status).toBe(0);
      expect(JSON.parse(stdout)).toMatchObject({
        header: "feat: ✨ hello there",
      });
      expect(stderr).toContain("Running in dry mode");
    });

    it("should reject an invalid type from --stdin without prompting", () => {
      const stdin = JSON.stringify({
        ...defaultCommitPayload(),
        type: "nope",
      });
      let output = "";

      try {
        execSync(`node "${BIN}" commit --dry-run --stdin`, {
          cwd: E2E_CWD,
          encoding: "utf-8",
          input: Buffer.from(stdin),
          timeout: 5000,
        });
      } catch (error: unknown) {
        if (error instanceof Error && "stderr" in error) {
          output = String(error.stderr);
        }
      }

      expect(output).toContain('Invalid type "nope"');
    });

    it("should reject stdin missing the required type without prompting", () => {
      const stdin = JSON.stringify({ subject: "hello there" });
      let output = "";

      try {
        execSync(`node "${BIN}" commit --dry-run --stdin`, {
          cwd: E2E_CWD,
          encoding: "utf-8",
          input: Buffer.from(stdin),
          timeout: 5000,
        });
      } catch (error: unknown) {
        if (error instanceof Error && "stderr" in error) {
          output = String(error.stderr);
        }
      }

      expect(output).toContain('Invalid type ""');
    });
  });

  describe("branch", () => {
    it("should format a branch name with type, scope and subject", () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        scope: "ui",
      });

      const result = runBranch("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"feat/ui/add-dark-mode"`);
    });

    it("should format a branch name with type and subject only", () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        subject: "fix login bug",
        type: "fix",
      });

      const result = runBranch("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"fix/fix-login-bug"`);
    });

    it("should include issue reference in branch name", () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        issue: "PROJ-123",
        subject: "add feature",
      });

      const result = runBranch("--stdin", stdin);

      expect(result).toMatchInlineSnapshot(`"feat/PROJ-123-add-feature"`);
    });

    it("should format a branch name with --from flag", () => {
      const stdin = JSON.stringify(defaultBranchPayload());

      const result = runBranch("--stdin --from main", stdin);

      expect(result).toMatchInlineSnapshot(`"feat/add-dark-mode"`);
    });

    it("should skip prompts when --type and --subject are provided as flags", () => {
      const result = runBranch("--type feat -m add-dark-mode");

      expect(result).toMatchInlineSnapshot(`"feat/add-dark-mode"`);
    });

    it("should skip prompts and include scope when --type, --scope, and --subject are provided", () => {
      const result = runBranch("--type feat --scope ui -m add-dark-mode");

      expect(result).toMatchInlineSnapshot(`"feat/ui/add-dark-mode"`);
    });

    it("should print the no TTY error on stderr only", () => {
      const { status, stderr, stdout } = run(["branch", "--dry-run"]);

      expect(status).toBe(1);
      expect(stdout).toBe("");
      expect(stderr).toContain("No TTY detected");
    });

    it("should reject an invalid type from --stdin without prompting", () => {
      const stdin = JSON.stringify({
        ...defaultBranchPayload(),
        type: "nope",
      });
      let output = "";

      try {
        execSync(`node "${BIN}" branch --dry-run --stdin`, {
          cwd: E2E_CWD,
          encoding: "utf-8",
          input: Buffer.from(stdin),
          timeout: 5000,
        });
      } catch (error: unknown) {
        if (error instanceof Error && "stderr" in error) {
          output = String(error.stderr);
        }
      }

      expect(output).toContain('Invalid type "nope"');
    });

    it("should reject stdin missing the required subject without prompting", () => {
      const stdin = JSON.stringify({ type: "feat" });
      let output = "";

      try {
        execSync(`node "${BIN}" branch --dry-run --stdin`, {
          cwd: E2E_CWD,
          encoding: "utf-8",
          input: Buffer.from(stdin),
          timeout: 5000,
        });
      } catch (error: unknown) {
        if (error instanceof Error && "stderr" in error) {
          output = String(error.stderr);
        }
      }

      expect(output).toContain("Subject is required");
    });
  });
});
