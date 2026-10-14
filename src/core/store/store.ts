import fs from "node:fs";
import path from "node:path";

import type { InferOutput } from "valibot";
import { parseJson, pipe, safeParse, string } from "valibot";

import { PartialMessagePartsSchema } from "@/core/conventional/schema";

import { gitzyStorePath } from "./utils";

type StoredAnswers = InferOutput<typeof PartialMessagePartsSchema>;

/**
 * Persists the previous commit answers so `--retry` can reuse them
 */
export class GitzyStore {
  #data?: StoredAnswers;
  readonly path = gitzyStorePath();

  load() {
    this.#data ??= this.#read();

    return this.#data;
  }

  save(data: StoredAnswers) {
    this.#data = data;
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2), {
      mode: 0o0600,
    });
  }

  #read(): StoredAnswers {
    let raw: string;

    try {
      raw = fs.readFileSync(this.path, "utf-8");
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "EACCES"
      ) {
        throw new Error("gitzy does not have permission to load this file", {
          cause: error,
        });
      }

      return {};
    }

    const parsed = safeParse(
      pipe(string(), parseJson(), PartialMessagePartsSchema),
      raw
    );

    return parsed.success ? parsed.output : {};
  }
}
