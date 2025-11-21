import * as p from "@clack/prompts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cli } from "./cli";
import * as config from "./config/load-gitzy-config";
import { defaultAnswers } from "./defaults/answers";
import { defaultConfig } from "./defaults/config";
import * as gitChecks from "./lib/git/checks";
import * as gitCommits from "./lib/git/commits";

vi.mock("@clack/prompts");

vi.mock("../package.json", () => ({
  engines: { node: "18" },
  version: "1.0.0",
}));

describe("cli", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.argv = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should run with defaults", async () => {
    const mockResults = {
      body: "detailed description",
      breaking: "breaking change",
      issues: "#123",
      scope: "core",
      subject: "add new feature",
      type: "feat",
    };

    vi.mocked(p.group).mockResolvedValueOnce(mockResults);

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
      .spyOn(config, "loadGitzyConfig")
      .mockResolvedValueOnce(defaultConfig);

    await cli();

    expect(p.group).toHaveBeenCalledOnce();
    expect(checkIfGitSpy).toHaveBeenCalledExactlyOnceWith();
    expect(checkIfStagedSpy).toHaveBeenCalledExactlyOnceWith();
    expect(getUserConfigSpy).toHaveBeenNthCalledWith(1, undefined);
    expect(performCommitSpy).toHaveBeenNthCalledWith(
      1,
      {
        answers: { ...defaultAnswers, ...mockResults },
        config: defaultConfig,
      },
      { emoji: true, hook: undefined },
    );
  });
});
