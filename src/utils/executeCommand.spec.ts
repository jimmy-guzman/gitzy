import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

import type { ChildProcess } from "node:child_process";

import { defaultConfig } from "../defaults";
import * as fns from "./executeCommand";

vi.mock("child_process");
vi.mock("fs");

describe("executeDryRun", () => {
  it("should console log git message", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(vi.fn());

    fns.executeDryRun("feat(cli): ✨ initial release");

    expect(spy).toMatchInlineSnapshot(`
      [MockFunction log] {
        "calls": [
          [
            "❯ Message...",
          ],
          [
            "
      feat(cli): ✨ initial release
      ",
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
  });
});

describe("executeGitMessage", () => {
  const answers = {
    body: "this an amazing feature, lots of details",
    breaking: "breaks everything",
    issues: "#123",
    scope: "*",
    subject: "a cool new feature",
    type: "feat",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call executeCommand by default", () => {
    const mockSpawn = vi.mocked(spawn).mockImplementation(() => {
      return { on: vi.fn() } as unknown as ChildProcess;
    });

    fns.executeGitMessage({ answers, config: defaultConfig }, {});

    expect(mockSpawn).toHaveBeenCalledExactlyOnceWith(
      "git",
      expect.anything(),
      expect.anything(),
    );
  });

  it("should call executeDryRun and not executeCommand when in dry run mode", () => {
    const executeCommandSpy = vi
      .spyOn(fns, "executeCommand")
      .mockImplementation(vi.fn());
    const logSpy = vi.spyOn(console, "log").mockImplementation(vi.fn());

    fns.executeGitMessage({ answers, config: defaultConfig }, { dryRun: true });

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(executeCommandSpy).not.toHaveBeenCalled();
  });

  it("should write to .git/COMMIT_EDITMSG when hook is true", () => {
    const writeFileSyncSpy = vi.mocked(writeFileSync);

    fns.executeGitMessage({ answers, config: defaultConfig }, { hook: true });

    expect(writeFileSyncSpy).toHaveBeenCalledExactlyOnceWith(
      ".git/COMMIT_EDITMSG",
      expect.stringContaining("feat(*): ✨ a cool new feature"),
    );
  });

  it("should not call executeCommand when running in hook mode", () => {
    const executeCommandSpy = vi
      .spyOn(fns, "executeCommand")
      .mockImplementation(vi.fn());

    fns.executeGitMessage({ answers, config: defaultConfig }, { hook: true });

    expect(executeCommandSpy).not.toHaveBeenCalled();
  });
});
