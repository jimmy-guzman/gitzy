import Enquirer from "enquirer";

import { cli } from "./cli";
import { defaultConfig } from "./core/config/defaults";
import * as config from "./core/config/resolver";
import * as gitChecks from "./core/git/checks";
import * as gitOperations from "./core/git/operations";

const mockPrompt = vi.hoisted(() => {
  return vi.fn().mockResolvedValue({
    body: "",
    breaking: false,
    issues: "",
    scope: "",
    subject: "test commit",
    type: "feat",
  });
});

vi.mock("enquirer", () => ({
  default: vi.fn(() => ({ prompt: mockPrompt })),
}));

vi.mock("../package.json", () => ({
  engines: { node: "18" },
  version: "1.0.0",
}));

describe("cli", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(Enquirer).mockImplementation(function () {
      return { prompt: mockPrompt };
    } as unknown as typeof Enquirer);
    mockPrompt.mockResolvedValue({
      body: "",
      breaking: false,
      issues: "",
      scope: "",
      subject: "test commit",
      type: "feat",
    });
    process.argv = [];
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
      .mockResolvedValueOnce(defaultConfig);

    await cli();

    expect(Enquirer).toHaveBeenNthCalledWith(
      1,
      {
        autofill: true,
        cancel: expect.any(Function),
        styles: {
          danger: expect.any(Function),
          submitted: expect.any(Function),
        },
      },
      { emoji: true, hook: undefined },
    );
    expect(checkIfGitSpy).toHaveBeenCalledExactlyOnceWith();
    expect(checkIfStagedSpy).toHaveBeenCalledExactlyOnceWith();
    expect(getUserConfigSpy).toHaveBeenNthCalledWith(1, undefined);
    expect(performCommitSpy).toHaveBeenCalledWith(
      expect.stringContaining(""),
      expect.objectContaining({
        dryRun: undefined,
        hook: undefined,
        passthrough: undefined,
      }),
    );
  });
});
