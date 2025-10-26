import { writeFileSync } from "node:fs";

import { x } from "tinyexec";

import { defaultConfig } from "@/defaults/config";

import { performCommit } from "./commits";

vi.mock("tinyexec");
vi.mock("fs");

describe("performCommit", () => {
  const answers = {
    body: "this an amazing feature, lots of details",
    breaking: "breaks everything",
    issues: "#123",
    scope: "*",
    subject: "a cool new feature",
    type: "feat",
  };

  const mockOutput = {
    exitCode: 0,
    stderr: "",
    stdout: "",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call tinyexec x() by default", async () => {
    const mockX = vi.mocked(x).mockResolvedValue(mockOutput);

    await performCommit({ answers, config: defaultConfig }, {});

    expect(mockX).toHaveBeenCalledExactlyOnceWith(
      "git",
      [
        "commit",
        "-m",
        expect.stringContaining("feat(*): ✨ a cool new feature"),
      ],
      { nodeOptions: { stdio: "inherit" }, throwOnError: true },
    );
  });

  it("should log message and not call x() when in dry run mode", async () => {
    const mockX = vi.mocked(x);
    const logSpy = vi.spyOn(console, "log").mockImplementation(vi.fn());

    await performCommit({ answers, config: defaultConfig }, { dryRun: true });

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith("❯ Message...");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("feat(*): ✨ a cool new feature"),
    );
    expect(mockX).not.toHaveBeenCalled();
  });

  it("should write to .git/COMMIT_EDITMSG when hook is true", async () => {
    const writeFileSyncSpy = vi.mocked(writeFileSync);

    await performCommit({ answers, config: defaultConfig }, { hook: true });

    expect(writeFileSyncSpy).toHaveBeenCalledExactlyOnceWith(
      ".git/COMMIT_EDITMSG",
      expect.stringContaining("feat(*): ✨ a cool new feature"),
    );
  });

  it("should not call x() when running in hook mode", async () => {
    const mockX = vi.mocked(x);

    await performCommit({ answers, config: defaultConfig }, { hook: true });

    expect(mockX).not.toHaveBeenCalled();
  });

  it("should pass through additional arguments to git commit", async () => {
    const mockX = vi.mocked(x).mockResolvedValue(mockOutput);

    await performCommit(
      { answers, config: defaultConfig },
      { passthrough: ["--no-verify", "--amend"] },
    );

    expect(mockX).toHaveBeenCalledWith(
      "git",
      [
        "commit",
        "-m",
        expect.stringContaining("feat(*): ✨ a cool new feature"),
        "--no-verify",
        "--amend",
      ],
      { nodeOptions: { stdio: "inherit" }, throwOnError: true },
    );
  });

  it("should include emoji by default", async () => {
    const mockX = vi.mocked(x).mockResolvedValue(mockOutput);

    await performCommit({ answers, config: defaultConfig }, {});

    expect(mockX).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", expect.stringContaining("✨")],
      expect.anything(),
    );
  });

  it("should exclude emoji when emoji flag is false", async () => {
    const mockX = vi.mocked(x).mockResolvedValue(mockOutput);

    await performCommit({ answers, config: defaultConfig }, { emoji: false });

    expect(mockX).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", expect.not.stringContaining("✨")],
      expect.anything(),
    );
  });

  it("should handle errors from tinyexec x()", async () => {
    vi.mocked(x).mockRejectedValue(new Error("git error"));

    await expect(
      performCommit({ answers, config: defaultConfig }, {}),
    ).rejects.toThrow("Failed to execute git commit");
  });
});
