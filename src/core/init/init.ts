/**
 * Init command — generate a starter gitzy config file
 */

import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const CONFIG_FILENAME = ".gitzyrc.json";

const CONFIG_TEMPLATE = `${JSON.stringify(
  {
    branch: {
      checkout: true,
      max: 72,
      pattern: "{type}/{scope}/{issue}-{subject}",
      separator: "/",
    },
    breaking: {
      format: "footer",
    },
    emoji: {
      enabled: true,
    },
    header: {
      max: 50,
      min: 5,
    },
    issues: {
      pattern: "github",
      prefix: "closes",
    },
    scopes: [],
    types: ["chore", "docs", "feat", "fix", "refactor", "test", "style", "ci"],
  },
  null,
  2,
)}\n`;

interface InitOptions {
  force?: boolean;
}

interface InitResult {
  exists: boolean;
  filePath: string;
}

/**
 * Generate a starter gitzy config file in the given directory
 *
 * @param cwd - Directory to create the config file in (defaults to process.cwd())
 *
 * @param options - Options for init (force overwrite)
 *
 * @returns Result with the file path and whether it already existed
 */
export const init = (
  cwd = process.cwd(),
  options: InitOptions = {},
): InitResult => {
  const filePath = path.join(cwd, CONFIG_FILENAME);
  const exists = existsSync(filePath);

  if (!exists || options.force) {
    writeFileSync(filePath, CONFIG_TEMPLATE, "utf8");
  }

  return { exists, filePath };
};
