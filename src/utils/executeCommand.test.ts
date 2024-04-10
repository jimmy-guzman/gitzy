/* eslint-disable jest/no-large-snapshots */
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";

import { defaultConfig } from "../defaults";
import * as fns from "./executeCommand";

vi.mock("child_process");

describe("executeDryRun", () => {
  it("should console log git message", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(vi.fn());

    fns.executeDryRun("feat(cli): ✨ initial release");

    expect(spy).toMatchInlineSnapshot(`
      [MockFunction log] {
        "calls": [
          [
            "[34m❯ Message...[39m",
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

  it("should call executeCommand by default", () => {
    const mockSpawn = vi
      .mocked(spawn)
      .mockImplementation(() => ({ on: vi.fn() }) as unknown as ChildProcess);

    fns.executeGitMessage({ config: defaultConfig, answers }, {});

    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  it("should call executeDryRun and not executeCommand when in dry run mode", () => {
    const executeCommandSpy = vi
      .spyOn(fns, "executeCommand")
      .mockImplementation(vi.fn());
    const logSpy = vi.spyOn(console, "log").mockImplementation(vi.fn());

    fns.executeGitMessage({ config: defaultConfig, answers }, { dryRun: true });
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(executeCommandSpy).not.toHaveBeenCalled();
  });
});
