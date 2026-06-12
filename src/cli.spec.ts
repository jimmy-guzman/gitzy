import { cli } from "./cli";
import { defaultResolvedConfig } from "./core/config/defaults";
import * as config from "./core/config/resolver";
import * as gitChecks from "./core/git/checks";
import * as gitOperations from "./core/git/operations";
import * as gitSignoff from "./core/git/signoff";

vi.mock("@clack/prompts", () => {
  return {
    autocomplete: vi.fn().mockResolvedValue("feat"),
    cancel: vi.fn(),
    confirm: vi.fn().mockResolvedValue(false),
    group: vi.fn(async (prompts: Record<string, () => unknown>) => {
      const result: Record<string, unknown> = {};

      for (const [key, fn] of Object.entries(prompts)) {
        const value = await fn();

        if (value !== undefined) {
          result[key] = value;
        }
      }

      return result;
    }),
    isCancel: vi.fn().mockReturnValue(false),
    log: {
      error: vi.fn(),
      info: vi.fn(),
      message: vi.fn(),
      step: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
    },
    multiline: vi.fn().mockResolvedValue(""),
    text: vi.fn().mockResolvedValue("test commit"),
  };
});

vi.mock("../package.json", () => {
  return {
    engines: { node: "20" },
    version: "1.0.0",
  };
});

describe("cli", () => {
  const originalArgv = process.argv;

  beforeEach(async () => {
    vi.resetAllMocks();
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });

    const clack = vi.mocked(await import("@clack/prompts"));

    clack.group.mockImplementation(
      async (prompts: Record<string, () => unknown>) => {
        const result: Record<string, unknown> = {};

        for (const [key, fn] of Object.entries(prompts)) {
          const value = await fn();

          if (value !== undefined) {
            result[key] = value;
          }
        }

        return result;
      },
    );
    clack.autocomplete.mockResolvedValue("feat");
    clack.text.mockResolvedValue("test commit");
    clack.confirm.mockResolvedValue(false);
    clack.multiline.mockResolvedValue("");
    clack.isCancel.mockReturnValue(false);

    process.argv = ["node", "gitzy"];
  });

  afterEach(() => {
    Object.defineProperty(process.stdout, "isTTY", {
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
      defaultResolvedConfig,
    );

    process.argv = ["node", "gitzy", "-n"];

    await cli();

    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining(""),
      expect.objectContaining({ noVerify: true }),
    );
  });

  it("should derive the Signed-off-by trailer when -s is used", async () => {
    const performCommitSpy = vi
      .spyOn(gitOperations, "commit")
      .mockResolvedValueOnce({ committed: true, message: "" });

    vi.spyOn(gitSignoff, "getSignoffTrailer").mockResolvedValueOnce(
      "Test User <test@example.com>",
    );
    vi.spyOn(gitChecks, "checkIfGitRepo").mockResolvedValueOnce("");
    vi.spyOn(gitChecks, "checkIfStaged").mockResolvedValueOnce("");
    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
      defaultResolvedConfig,
    );

    process.argv = ["node", "gitzy", "-s"];

    await cli();

    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining("Signed-off-by: Test User <test@example.com>"),
      expect.any(Object),
    );
  });

  it("should use an explicit Signed-off-by override verbatim", async () => {
    const performCommitSpy = vi
      .spyOn(gitOperations, "commit")
      .mockResolvedValueOnce({ committed: true, message: "" });

    vi.spyOn(gitChecks, "checkIfGitRepo").mockResolvedValueOnce("");
    vi.spyOn(gitChecks, "checkIfStaged").mockResolvedValueOnce("");
    vi.spyOn(config, "resolveConfig").mockResolvedValueOnce(
      defaultResolvedConfig,
    );

    process.argv = ["node", "gitzy", "--signoff", "Bot <bot@example.com>"];

    await cli();

    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining("Signed-off-by: Bot <bot@example.com>"),
      expect.any(Object),
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
      }),
    );
  });
});
