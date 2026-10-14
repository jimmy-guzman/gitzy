import { getSignoffTrailer } from "./signoff";
import { git, useTempGitRepo } from "./test-utils";

describe(getSignoffTrailer, () => {
  useTempGitRepo();

  it('should return "Name <email>" from the committer identity', async () => {
    await expect(getSignoffTrailer()).resolves.toBe(
      "Jane Doe <jane@example.com>"
    );
  });

  it("should return an empty string when no identity is configured", async () => {
    await git("config", "--unset", "user.name");
    await git("config", "--unset", "user.email");
    await git("config", "user.useConfigOnly", "true");

    await expect(getSignoffTrailer()).resolves.toBe("");
  });
});
