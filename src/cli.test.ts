import Enquirer from "enquirer";

import { cli } from "./cli";
import * as config from "./config";
import { defaultAnswers, defaultConfig } from "./defaults";
import * as utils from "./utils";

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
  it("should run with defaults", async () => {
    process.argv = [];

    const executeGitMessageSpy = vi
      .spyOn(utils, "executeGitMessage")
      .mockImplementationOnce(vi.fn());
    const checkIfGitSpy = vi
      .spyOn(utils, "checkIfGitRepo")
      .mockResolvedValueOnce("yes");
    const checkIfStagedSpy = vi
      .spyOn(utils, "checkIfStaged")
      .mockResolvedValueOnce("yes");

    const getUserConfigSpy = vi
      .spyOn(config, "getUserConfig")
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
    expect(checkIfGitSpy).toHaveBeenCalledTimes(1);
    expect(checkIfStagedSpy).toHaveBeenCalledTimes(1);
    expect(getUserConfigSpy).toHaveBeenNthCalledWith(1, undefined);
    expect(executeGitMessageSpy).toHaveBeenNthCalledWith(
      1,
      {
        answers: defaultAnswers,
        config: defaultConfig,
      },
      { emoji: true, hook: undefined },
    );
  });
});
