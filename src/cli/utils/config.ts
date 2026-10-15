import { notice } from "@/cli/utils/log";
import { resolveConfig } from "@/core/config/resolver";

/**
 * Resolves the config and prints its warnings to stderr, so stdout stays clean for `--json` and `gitzy config`.
 *
 * @returns The resolved config
 */
export const resolveConfigWithWarnings = async () => {
  const { config, warnings } = await resolveConfig();

  for (const warning of warnings) {
    notice.warn(warning);
  }

  return config;
};
