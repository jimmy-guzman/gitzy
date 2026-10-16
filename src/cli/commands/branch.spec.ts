import { cli } from "@/cli";
import { notice } from "@/cli/utils/log";
import * as stdinUtils from "@/cli/utils/stdin";
import * as parser from "@/core/branch/parser";
import { defaultResolvedConfig } from "@/core/config/defaults";
import * as config from "@/core/config/resolver";
import { getCurrentBranch } from "@/core/git/branch";
import { git, useTempGitRepo } from "@/core/git/test-utils";

const baseArgs = ["node", "gitzy", "branch"];

describe("branch command", () => {
  const originalArgv = process.argv;

  useTempGitRepo();

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    vi.spyOn(config, "resolveConfig").mockResolvedValue({
      config: defaultResolvedConfig,
      warnings: [],
    });
    process.argv = [...baseArgs];
  });

  afterEach(() => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: undefined,
    });
    process.argv = originalArgv;
  });

  it("should create a branch from valid --stdin answers with only type and subject", async () => {
    vi.spyOn(stdinUtils, "readStdinJson").mockResolvedValueOnce({
      subject: "add dark mode",
      type: "feat",
    });

    process.argv = [...baseArgs, "--stdin"];

    await cli();

    await expect(getCurrentBranch()).resolves.toBe("feat/add-dark-mode");
  });

  it("should exit 1 and report an invalid type from --stdin", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const errorSpy = vi.spyOn(notice, "error").mockImplementation(() => {
      // noop
    });

    vi.spyOn(stdinUtils, "readStdinJson").mockResolvedValueOnce({
      subject: "hello there",
      type: "nope",
    });

    process.argv = [...baseArgs, "--stdin"];

    await expect(cli()).rejects.toThrow("process.exit(1)");

    expect(exitSpy).toHaveBeenCalledExactlyOnceWith(1);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('Invalid type "nope"')
    );
  });

  it("should exit 1 and report a missing subject from --stdin", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const errorSpy = vi.spyOn(notice, "error").mockImplementation(() => {
      // noop
    });

    vi.spyOn(stdinUtils, "readStdinJson").mockResolvedValueOnce({
      type: "feat",
    });

    process.argv = [...baseArgs, "--stdin"];

    await expect(cli()).rejects.toThrow("process.exit(1)");

    expect(exitSpy).toHaveBeenCalledExactlyOnceWith(1);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith("Subject is required");
  });

  it("should exit 1 and report an invalid scope from --stdin", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const errorSpy = vi.spyOn(notice, "error").mockImplementation(() => {
      // noop
    });

    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce({
      config: { ...defaultResolvedConfig, scopes: [{ name: "api" }] },
      warnings: [],
    });
    vi.spyOn(stdinUtils, "readStdinJson").mockResolvedValueOnce({
      scope: "bogus",
      subject: "add dark mode",
      type: "feat",
    });

    process.argv = [...baseArgs, "--stdin"];

    await expect(cli()).rejects.toThrow("process.exit(1)");

    expect(exitSpy).toHaveBeenCalledExactlyOnceWith(1);
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('Invalid scope "bogus"')
    );
  });

  it("should skip prompts when --type and --subject flags are provided", async () => {
    process.argv = [...baseArgs, "--type", "feat", "-m", "add dark mode"];

    await cli();

    await expect(getCurrentBranch()).resolves.toBe("feat/add-dark-mode");
  });

  it("should prefill --amend from the branch name with the default pattern", async () => {
    const parseSpy = vi.spyOn(parser, "parseBranchName");

    await git("switch", "-c", "feat/dark-mode");

    process.argv = [
      ...baseArgs,
      "--amend",
      "--type",
      "feat",
      "-m",
      "dark mode",
      "-D",
    ];

    await cli();

    expect(parseSpy).toHaveBeenCalledExactlyOnceWith("feat/dark-mode", []);
  });

  it("should not prefill --amend with a custom pattern", async () => {
    const parseSpy = vi.spyOn(parser, "parseBranchName");

    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce({
      config: {
        ...defaultResolvedConfig,
        branch: {
          ...defaultResolvedConfig.branch,
          pattern: "{issue}/{type}-{subject}",
        },
      },
      warnings: [],
    });

    await git("switch", "-c", "PROJ-1/feat-dark-mode");

    process.argv = [
      ...baseArgs,
      "--amend",
      "--type",
      "feat",
      "-m",
      "dark mode",
      "-D",
    ];

    await cli();

    expect(parseSpy).not.toHaveBeenCalled();
  });

  it("should error when no TTY is detected and --stdin is not used", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });

    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: undefined,
    });

    process.argv = [...baseArgs];

    await expect(cli()).rejects.toThrow("process.exit(1)");

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
