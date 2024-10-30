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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        cancel: expect.any(Function),
        styles: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          submitted: expect.any(Function),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          danger: expect.any(Function),
        },
      },
      { emoji: true },
    );
    expect(checkIfGitSpy).toHaveBeenCalledTimes(1);
    expect(checkIfStagedSpy).toHaveBeenCalledTimes(1);
    expect(getUserConfigSpy).toHaveBeenNthCalledWith(1, undefined);
    expect(executeGitMessageSpy).toHaveBeenNthCalledWith(
      1,
      {
        config: defaultConfig,
        answers: defaultAnswers,
      },
      { emoji: true },
    );
  });
});
