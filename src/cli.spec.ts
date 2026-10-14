import { writeFileSync } from "node:fs";
import path from "node:path";

import { cli } from "./cli";
import { defaultResolvedConfig } from "./core/config/defaults";
import * as config from "./core/config/resolver";
import * as gitChecks from "./core/git/checks";
import * as gitOperations from "./core/git/operations";
import * as gitSignoff from "./core/git/signoff";
import { git, useTempGitRepo } from "./core/git/test-utils";

const answerArgs = ["node", "gitzy", "--type", "feat", "-m", "test commit"];

describe(cli, () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });

    process.argv = [...answerArgs];
  });

  afterEach(() => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: undefined,
    });
    process.argv = originalArgv;
  });

  it("should pass noVerify when -n flag is used", async () => {
    const performCommitSpy = vi
      .spyOn(gitOperations, "commit")
      .mockResolvedValueOnce({ committed: true, message: "" });

    vi.spyOn(gitChecks, "checkIfGitRepo").mockResolvedValueOnce("");
    vi.spyOn(gitChecks, "checkIfStaged").mockResolvedValueOnce("");
    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
      defaultResolvedConfig
    );

    process.argv = [...answerArgs, "-n"];

    await cli();

    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining(""),
      expect.objectContaining({ noVerify: true })
    );
  });

  it("should derive the Signed-off-by trailer when -s is used", async () => {
    const performCommitSpy = vi
      .spyOn(gitOperations, "commit")
      .mockResolvedValueOnce({ committed: true, message: "" });

    vi.spyOn(gitSignoff, "getSignoffTrailer").mockResolvedValueOnce(
      "Test User <test@example.com>"
    );
    vi.spyOn(gitChecks, "checkIfGitRepo").mockResolvedValueOnce("");
    vi.spyOn(gitChecks, "checkIfStaged").mockResolvedValueOnce("");
    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
      defaultResolvedConfig
    );

    process.argv = [...answerArgs, "-s"];

    await cli();

    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining("Signed-off-by: Test User <test@example.com>"),
      expect.any(Object)
    );
  });

  it("should use an explicit Signed-off-by override verbatim", async () => {
    const performCommitSpy = vi
      .spyOn(gitOperations, "commit")
      .mockResolvedValueOnce({ committed: true, message: "" });

    vi.spyOn(gitChecks, "checkIfGitRepo").mockResolvedValueOnce("");
    vi.spyOn(gitChecks, "checkIfStaged").mockResolvedValueOnce("");
    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
      defaultResolvedConfig
    );

    process.argv = [...answerArgs, "--signoff", "Bot <bot@example.com>"];

    await cli();

    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining("Signed-off-by: Bot <bot@example.com>"),
      expect.any(Object)
    );
  });

  it("should run with defaults", async () => {
    const performCommitSpy = vi
      .spyOn(gitOperations, "commit")
      .mockResolvedValueOnce({ committed: true, message: "" });
    const checkIfGitSpy = vi
      .spyOn(gitChecks, "checkIfGitRepo")
      .mockResolvedValueOnce("");
    const checkIfStagedSpy = vi
      .spyOn(gitChecks, "checkIfStaged")
      .mockResolvedValueOnce("");

    const getUserConfigSpy = vi
      .spyOn(config, "resolveConfig")
      .mockResolvedValueOnce(defaultResolvedConfig);

    await cli();

    expect(checkIfGitSpy).toHaveBeenCalledExactlyOnceWith();
    expect(checkIfStagedSpy).toHaveBeenCalledExactlyOnceWith();
    expect(getUserConfigSpy).toHaveBeenCalledExactlyOnceWith();
    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining(""),
      expect.objectContaining({
        amend: undefined,
        dryRun: undefined,
        hook: false,
        noVerify: undefined,
      })
    );
  });

  describe("when hook mode is inferred from the environment", () => {
    useTempGitRepo();

    it.each([
      ["GIT_DIR", ".git"],
      ["GIT_INDEX_FILE", path.join(".git", "index")],
    ])(
      "should warn and not commit when hook mode is inferred from %s",
      async (name, value) => {
        writeFileSync("file.txt", "hello");
        await git("add", "file.txt");
        vi.stubEnv(name, value);
        vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
          defaultResolvedConfig
        );
        const stderrSpy = vi
          .spyOn(process.stderr, "write")
          .mockReturnValue(true);

        await cli();

        const stderr = stderrSpy.mock.calls.map(([chunk]) => chunk).join("");

        expect(stderr).toContain(`Inferred hook mode from ${name}`);
        expect(stderr).toContain("--hook");
        expect(stderr).toContain(path.join(".git", "COMMIT_EDITMSG"));
        await expect(git("rev-list", "--count", "HEAD")).resolves.toBe("1");
      }
    );

    it("should not warn when --hook is passed", async () => {
      vi.stubEnv("GIT_DIR", ".git");
      vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
        defaultResolvedConfig
      );
      const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);

      process.argv = [...answerArgs, "--hook"];

      await cli();

      const stderr = stderrSpy.mock.calls.map(([chunk]) => chunk).join("");

      expect(stderr).not.toContain("Inferred hook mode");
    });
  });
});
