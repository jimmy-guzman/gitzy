import Enquirer from "enquirer";

import { cli } from "./cli";
import * as config from "./config/loaders/user";
import { defaultAnswers } from "./defaults/answers";
import { defaultConfig } from "./defaults/config";
import * as gitChecks from "./lib/git/checks";
import * as gitCommits from "./lib/git/commits";

vi.mock("enquirer");

vi.mock("../package.json", () => {
  return {
    engines: { node: "18" },
    version: "1.0.0",
  };
});

describe("cli", () => {
  beforeAll(() => {
    vi.mocked(Enquirer).mockImplementation(() => {
      return {
        prompt: vi.fn(),
      } as unknown as Enquirer;
    });
  });

  beforeEach(() => {
    vi.resetAllMocks();
    process.argv = [];
  });

  it("should run with defaults", async () => {
    const performCommitSpy = vi
      .spyOn(gitCommits, "performCommit")
      .mockResolvedValueOnce(undefined);
    const checkIfGitSpy = vi
      .spyOn(gitChecks, "checkIfGitRepo")
      .mockResolvedValueOnce("");
    const checkIfStagedSpy = vi
      .spyOn(gitChecks, "checkIfStaged")
      .mockResolvedValueOnce("");

    const getUserConfigSpy = vi
      .spyOn(config, "loadUserConfig")
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
    expect(performCommitSpy).toHaveBeenNthCalledWith(
      1,
      {
        answers: defaultAnswers,
        config: defaultConfig,
      },
      { emoji: true, hook: undefined },
    );
  });
});
