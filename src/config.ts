import type { _UserConfig } from "./config/gitzy-schema";
import type { UserConfig } from "./config/user-config";

/**
 * Defines the configuration for `gitzy`.
 */
export const defineConfig = (config: UserConfig) => {
  return config satisfies _UserConfig;
};
