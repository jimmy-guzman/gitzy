import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { InferOutput } from "valibot";
import { parseJson, pipe, safeParse, string } from "valibot";

import { PartialMessagePartsSchema } from "@/core/conventional/schema";

type StoredAnswers = InferOutput<typeof PartialMessagePartsSchema>;

/**
 * Path of the file holding the previous commit answers, e.g. `$TMPDIR/gitzy/v7/<cwd-basename>-store.json`
 */
export const storePath = () =>
  path.join(
    os.tmpdir(),
    "gitzy",
    "v7",
    `${path.basename(process.cwd())}-store.json`
  );

/**
 * Persists the previous commit answers so `--retry` can reuse them
 */
export const saveAnswers = (data: StoredAnswers) => {
  const file = storePath();

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o0600 });
};

/**
 * Loads the previous commit answers, or `{}` when missing or invalid
 */
export const loadAnswers = (): StoredAnswers => {
  let raw: string;

  try {
    raw = fs.readFileSync(storePath(), "utf-8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EACCES") {
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
};
