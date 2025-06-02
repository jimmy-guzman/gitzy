import fs from "node:fs";
import path from "node:path";

import type { GitzyStoreError } from "./types";

import { gitzyStorePath, mkdir, tryUnlink } from "./utils";

const idx = Symbol("gitzy");

/**
 * Minimal typed version of [data-store](https://github.com/jonschlinkert/data-store/tree/4.1.0)
 *
 * @todo add unit tests
 */
export class GitzyStore<T = Record<string, unknown>> {
  [idx]?: T;

  path: string;

  get data(): T {
    return this[idx] ?? this.tryLoad();
  }

  constructor() {
    this.path = gitzyStorePath();
  }

  public clear = (): void => {
    this.save({} as T);
  };

  public destroy = (): void => {
    tryUnlink(this.path);
  };

  public load = (): T => {
    return this.data;
  };

  public save(data: T): void {
    this[idx] = data;
    this.writeFile();
  }

  private readonly json = (): string => {
    return JSON.stringify(this.data, null, 2);
  };

  private readonly readParseFile = (): T => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- JSON.parse returns any
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
    mkdir(path.dirname(this.path));
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
  };
}
