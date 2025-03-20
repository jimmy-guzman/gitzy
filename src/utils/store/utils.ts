import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { GitzyStoreError } from "./types";

export const tryStat = (filepath: string): fs.Stats | null => {
  try {
    return fs.statSync(filepath);
  } catch {
    return null;
  }
};

export const handleError = (dirname: string, err: GitzyStoreError): void => {
  if (err.message.includes("null bytes")) {
    throw new Error(err.message);
  }

  const isIgnored =
    ["EEXIST", "EISDIR", "EPERM"].includes(err.code) &&
    path.dirname(dirname) !== dirname;

  if (!isIgnored) {
    throw new Error(err.message);
  }
};

export const directoryExists = (dirname: string, strict = true): boolean => {
  const stat = tryStat(dirname);

  if (stat) {
    if (strict && !stat.isDirectory()) {
      throw new Error(`Path exists and is not a directory: "${dirname}"`);
    }

    return true;
  }

  return false;
};

export const mkdir = (dirname: string): void => {
  if (directoryExists(dirname)) return;

  try {
    fs.mkdirSync(dirname, { recursive: true });
  } catch (error: unknown) {
    handleError(dirname, error as GitzyStoreError);
  }
};

export const tryUnlink = (filepath: string): void => {
  try {
    fs.unlinkSync(filepath);
  } catch (error: unknown) {
    const dataStoreError = error as GitzyStoreError;

    if (dataStoreError.code !== "ENOENT") {
      throw new Error(dataStoreError.message);
    }
  }
};

/**
 * Constructs gitzy's store path based on the OS's temp directory and current directory
 *
 * @example
 * const path = gitzyStorePath()
 * console.log(path) // /var/folders/17/{tmpdir}/T/gitzy/gitzy-store.json
 */
export const gitzyStorePath = (): string => {
  return `${os.tmpdir()}/gitzy/${path.basename(process.cwd())}-store.json`;
};
