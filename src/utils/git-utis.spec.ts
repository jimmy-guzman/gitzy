import * as child_process from "node:child_process";

import { checkIfGitRepo, checkIfStaged, shouldDoGitChecks } from "./git-utils";

vi.mock("node:child_process");

const childProcessMock = vi.mocked(child_process.exec);

const mockExec = (value: null | string = null): void => {
  childProcessMock.mockImplementation((_command, callback) => {
    if (typeof callback === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-function-type -- mock
      return (callback as Function)(value, { stdout: "ok" });
    }

    return undefined;
  });
};

describe("shouldDoGitChecks", () => {
  it.each(["--add", "-a", "--amend"])(`should skip git check if %i`, (flag) => {
    expect(shouldDoGitChecks([flag])).toBe(false);
  });

  it("should perform check if no flags", () => {
    expect(shouldDoGitChecks()).toBe(true);
  });
});

describe("checkIfStaged", () => {
  it("should throw", async () => {
    mockExec();

    await expect(checkIfStaged()).rejects.toThrow("No files staged");
  });

  it("should rethrow", async () => {
    mockExec("error");

    await expect(checkIfStaged()).resolves.toBe("");
  });
});

describe("checkIfGitRepo", () => {
  it("should throw", async () => {
    mockExec("error");

    await expect(checkIfGitRepo()).rejects.toThrow("Not a git repository");
  });

  it("should resolve", async () => {
    mockExec();

    await expect(checkIfGitRepo()).resolves.toBe("");
  });
});
