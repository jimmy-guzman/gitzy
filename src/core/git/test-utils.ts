import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { x } from "tinyexec";

const leakyGitEnv = [
  "EMAIL",
  "GIT_AUTHOR_EMAIL",
  "GIT_AUTHOR_NAME",
  "GIT_COMMITTER_EMAIL",
  "GIT_COMMITTER_NAME",
  "GIT_DIR",
  "GIT_INDEX_FILE",
  "GIT_WORK_TREE",
] as const;

/**
 * Run git in the current directory and return its trimmed stdout
 */
export const git = async (...args: string[]) => {
  const result = await x("git", args, { throwOnError: true });

  return result.stdout.trim();
};

/**
 * Registers hooks that run each test inside a fresh, isolated git repo
 * on `main` with one empty commit and a local identity.
 *
 * Global/system git config and inherited git env vars are ignored, and git
 * will not discover repos above the temp dir.
 */
export const useTempGitRepo = () => {
  const originalCwd = process.cwd();
  let dir = "";

  beforeEach(async () => {
    dir = realpathSync(mkdtempSync(path.join(os.tmpdir(), "gitzy-git-")));

    for (const name of leakyGitEnv) {
      vi.stubEnv(name, process.env[name]);
      Reflect.deleteProperty(process.env, name);
    }

    vi.stubEnv("GIT_CEILING_DIRECTORIES", path.dirname(dir));
    vi.stubEnv("GIT_CONFIG_GLOBAL", os.devNull);
    vi.stubEnv("GIT_CONFIG_NOSYSTEM", "1");
    process.chdir(dir);

    await git("init", "--initial-branch", "main");
    await git("config", "user.name", "Jane Doe");
    await git("config", "user.email", "jane@example.com");
    await git("commit", "--allow-empty", "--message", "chore: init");
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.unstubAllEnvs();
    rmSync(dir, { force: true, recursive: true });
  });
};
