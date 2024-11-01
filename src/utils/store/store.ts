import fs from "node:fs";
import path from "node:path";

import type { GitzyStoreError } from "./types";

import { gitzyStorePath, mkdir, tryUnlink } from "./utils";

const idx = Symbol("gitzy");

/**
 * Minimal typed version of [data-store](https://github.com/jonschlinkert/data-store/tree/4.1.0)
 * @todo add unit tests
 */
export class GitzyStore<T = Record<string, unknown>> {
  private readonly json = (): string => {
    return JSON.stringify(this.data, null, 2);
  };

  private readonly readParseFile = (): T => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(String(fs.readFileSync(this.path)));
  };

  private readonly tryLoad = (): T => {
    try {
      return (this[idx] = this.readParseFile());
    } catch (error: unknown) {
      const dataStoreError = error as GitzyStoreError;
      const hasPermissionError = dataStoreError.code === "EACCES";
      const hasMissingOrCorruptedFile =
        dataStoreError.code === "ENOENT" ||
        dataStoreError.name === "SyntaxError";

      if (hasPermissionError) {
        throw new Error("gitzy does not have permission to load this file");
      }

      if (hasMissingOrCorruptedFile) {
        this[idx] = {} as T;
        return {} as T;
      }

      return {} as T;
    }
  };

  private readonly writeFile = (): void => {
    mkdir(path.dirname(String(this.path)));
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
  };

  public clear = (): void => {
    this.save({} as T);
  };

  public destroy = (): void => {
    tryUnlink(this.path);
  };

  [idx]?: T;

  public load = (): T => {
    return this.data;
  };

  path: string;

  constructor() {
    this.path = gitzyStorePath();
  }

  public save(data: T): void {
    this[idx] = data;
    this.writeFile();
  }

  get data(): T {
    return this[idx] ?? this.tryLoad();
  }
}
