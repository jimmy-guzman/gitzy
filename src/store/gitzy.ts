import fs from "node:fs";
import path from "node:path";

import type { GitzyStoreError } from "./types";

import { gitzyStorePath, mkdir, tryUnlink } from "./utils";

const idx = Symbol("gitzy");

/**
 * Minimal typed version of [data-store](https://github.com/jonschlinkert/data-store/tree/4.1.0)
 *
 */
export class GitzyStore<T = Record<string, unknown>> {
  [idx]?: T;
  path: string;

  get data(): T {
    return this[idx] ?? this.#tryLoad();
  }

  constructor() {
    this.path = gitzyStorePath();
  }

  clear() {
    this.save({} as T);
  }

  destroy() {
    tryUnlink(this.path);
  }

  load(): T {
    return this.data;
  }

  save(data: T) {
    this[idx] = data;
    this.#writeFile();
  }

  #json() {
    return JSON.stringify(this.data, null, 2);
  }

  #readParseFile() {
    return JSON.parse(String(fs.readFileSync(this.path))) as T;
  }

  #tryLoad(): T {
    try {
      return (this[idx] = this.#readParseFile());
    } catch (error) {
      const err = error as GitzyStoreError;

      if (err.code === "EACCES") {
        throw new Error("gitzy does not have permission to load this file", {
          cause: error,
        });
      }

      if (err.code === "ENOENT" || err.name === "SyntaxError") {
        return (this[idx] = {} as T);
      }

      return {} as T;
    }
  }

  #writeFile() {
    mkdir(path.dirname(this.path));

    fs.writeFileSync(this.path, this.#json(), { mode: 0o0600 });
  }
}
