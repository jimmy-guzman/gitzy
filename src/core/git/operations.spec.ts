import { writeFileSync } from "node:fs";
import path from "node:path";

import { x } from "tinyexec";

import { commit } from "./operations";

vi.mock("node:fs");
vi.mock("tinyexec");

describe("commit", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return committed: false without executing git when dryRun is true", async () => {
    const result = await commit("feat: add feature", { dryRun: true });

    expect(result).toStrictEqual({
      committed: false,
      message: "feat: add feature",
    });
    expect(x).not.toHaveBeenCalled();
  });

  it("should write to COMMIT_EDITMSG and return committed: true when hook is true", async () => {
    const result = await commit("feat: add feature", { hook: true });

    expect(writeFileSync).toHaveBeenCalledWith(
      path.join(".git", "COMMIT_EDITMSG"),
      "feat: add feature",
    );
    expect(result).toStrictEqual({
      committed: true,
      message: "feat: add feature",
    });
    expect(x).not.toHaveBeenCalled();
  });

  it("should use GIT_DIR env var when set for COMMIT_EDITMSG path", async () => {
    vi.stubEnv("GIT_DIR", "/custom/git/dir");

    const result = await commit("feat: add feature", { hook: true });

    expect(writeFileSync).toHaveBeenCalledWith(
      path.join("/custom/git/dir", "COMMIT_EDITMSG"),
      "feat: add feature",
    );
    expect(result).toStrictEqual({
      committed: true,
      message: "feat: add feature",
    });

    vi.unstubAllEnvs();
  });

  it("should execute git commit with the message", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    const result = await commit("feat: add feature");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", "feat: add feature"],
      { nodeOptions: { stdio: "inherit" } },
    );
    expect(result).toStrictEqual({
      committed: true,
      message: "feat: add feature",
    });
  });

  it("should pass through additional git flags", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await commit("feat: add feature", { passthrough: ["--no-verify"] });

    expect(x).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", "feat: add feature", "--no-verify"],
      { nodeOptions: { stdio: "inherit" } },
    );
  });

  it("should call process.exit with the exit code when git commit fails", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 1, stderr: "", stdout: "" });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockReturnValue(undefined as never);

    await commit("feat: add feature");

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should use defaults when no options are provided", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    const result = await commit("chore: update deps");

    expect(x).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", "chore: update deps"],
      { nodeOptions: { stdio: "inherit" } },
    );
    expect(result).toStrictEqual({
      committed: true,
      message: "chore: update deps",
    });
  });
});
