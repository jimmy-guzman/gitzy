import type { GitzyConfig } from "../interfaces";

import { getUserConfig } from "./getUserConfig";
import * as helpers from "./helpers";

const mockUserConfig = { disableEmoji: true };
const mockCommitlintConfig = { headerMinLength: 5 };

const mockLoadConfig = (
  config: null | Partial<GitzyConfig> = mockUserConfig,
) => {
  return vi
    .spyOn(helpers, "loadConfig")
    .mockResolvedValueOnce(config ? { config, filepath: "" } : null);
};

const mockGetCommitlintConfig = (config = mockCommitlintConfig) => {
  return vi.spyOn(helpers, "getCommitlintConfig").mockResolvedValueOnce(config);
};

const mockValidateUserConfig = (isValid = true) => {
  return vi.spyOn(helpers, "validateUserConfig").mockResolvedValueOnce(isValid);
};

describe("getUserConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should only return user config when loaded & isValid", async () => {
    const loadConfigSpy = mockLoadConfig();
    const getCommitlintConfigSpy = mockGetCommitlintConfig();
    const validateUserConfigSpy = mockValidateUserConfig();

    const config = await getUserConfig();

    expect(loadConfigSpy).toHaveBeenNthCalledWith(1, "gitzy");
    expect(validateUserConfigSpy).toHaveBeenNthCalledWith(1, mockUserConfig);
    expect(getCommitlintConfigSpy).not.toHaveBeenCalled();
    expect(config).toStrictEqual(mockUserConfig);
  });

  it("should merge user & commitlint configs when --commitlint", async () => {
    const loadConfigSpy = mockLoadConfig();
    const getCommitlintConfigSpy = mockGetCommitlintConfig();
    const validateUserConfigSpy = mockValidateUserConfig();

    const config = await getUserConfig(true);

    expect(loadConfigSpy).toHaveBeenNthCalledWith(1, "gitzy");
    expect(validateUserConfigSpy).toHaveBeenNthCalledWith(1, mockUserConfig);
    expect(getCommitlintConfigSpy).toHaveBeenCalledExactlyOnceWith();
    expect(config).toStrictEqual({
      ...mockUserConfig,
      ...mockCommitlintConfig,
    });
  });

  it("should only return commitlint config when not loaded and --commitlint", async () => {
    const loadConfigSpy = mockLoadConfig(null);
    const getCommitlintConfigSpy = mockGetCommitlintConfig();
    const validateUserConfigSpy = mockValidateUserConfig();

    const config = await getUserConfig(true);

    expect(loadConfigSpy).toHaveBeenNthCalledWith(1, "gitzy");
    expect(validateUserConfigSpy).not.toHaveBeenCalled();
    expect(getCommitlintConfigSpy).toHaveBeenCalledExactlyOnceWith();
    expect(config).toStrictEqual(mockCommitlintConfig);
  });

  it("should return null when not loaded nor --commitlint", async () => {
    const loadConfigSpy = mockLoadConfig(null);
    const getCommitlintConfigSpy = mockGetCommitlintConfig();
    const validateUserConfigSpy = mockValidateUserConfig();

    const config = await getUserConfig();

    expect(loadConfigSpy).toHaveBeenNthCalledWith(1, "gitzy");
    expect(validateUserConfigSpy).not.toHaveBeenCalled();
    expect(getCommitlintConfigSpy).not.toHaveBeenCalled();
    expect(config).toBeNull();
  });

  it("should return null when loaded and not valid", async () => {
    const loadConfigSpy = mockLoadConfig();
    const getCommitlintConfigSpy = mockGetCommitlintConfig();
    const validateUserConfigSpy = mockValidateUserConfig(false);

    const config = await getUserConfig();

    expect(loadConfigSpy).toHaveBeenNthCalledWith(1, "gitzy");
    expect(validateUserConfigSpy).toHaveBeenNthCalledWith(1, mockUserConfig);
    expect(getCommitlintConfigSpy).not.toHaveBeenCalled();
    expect(config).toBeNull();
  });
});
