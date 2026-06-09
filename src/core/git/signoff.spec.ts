import { x } from "tinyexec";

import { getSignoffTrailer } from "./signoff";

vi.mock("tinyexec");

describe("getSignoffTrailer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should parse "Name <email>" from GIT_COMMITTER_IDENT', async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "Jane Doe <jane@example.com> 1700000000 -0700",
    });

    await expect(getSignoffTrailer()).resolves.toBe(
      "Jane Doe <jane@example.com>",
    );
    expect(x).toHaveBeenCalledWith("git", ["var", "GIT_COMMITTER_IDENT"], {
      throwOnError: true,
    });
  });

  it("should trim surrounding whitespace before parsing", async () => {
    vi.mocked(x).mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: "  Jane Doe <jane@example.com> 1700000000 -0700\n",
    });

    await expect(getSignoffTrailer()).resolves.toBe(
      "Jane Doe <jane@example.com>",
    );
  });

  it("should return an empty string when git throws", async () => {
    vi.mocked(x).mockRejectedValue(new Error("no identity"));

    await expect(getSignoffTrailer()).resolves.toBe("");
  });

  it("should return an empty string when output has no identity", async () => {
    vi.mocked(x).mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    await expect(getSignoffTrailer()).resolves.toBe("");
  });
});
