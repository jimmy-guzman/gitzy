import { pathToFileURL } from "node:url";

import type { Loader } from "lilconfig";

type TsModule = Record<string, unknown> & {
  default?: unknown;
};

const isTsModule = (value: unknown): value is TsModule => {
  return typeof value === "object" && value !== null;
};

const supportsNativeTs = () => {
  const [major, minor] = process.versions.node.split(".").map(Number);

  return major > 22 || (major === 22 && minor >= 8);
};

export const loadTs: Loader = async (filepath) => {
  if (!supportsNativeTs()) {
    throw new Error(
      `TS config requires Node 22.8+. Current: ${process.version}.`,
    );
  }

  const url = pathToFileURL(filepath).href;
  const imported = (await import(url)) as unknown;

  if (!isTsModule(imported)) {
    return imported;
  }

  return imported.default ?? imported;
};
