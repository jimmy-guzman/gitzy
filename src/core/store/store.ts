import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { InferOutput } from "valibot";
import { parseJson, pipe, safeParse, string } from "valibot";

import { PartialMessagePartsSchema } from "@/core/conventional/schema";
import { getGitDir } from "@/core/git/operations";

type StoredAnswers = InferOutput<typeof PartialMessagePartsSchema>;

/**
 * Path of the file holding the previous commit answers: `<git dir>/gitzy/retry.json`, or `$TMPDIR/gitzy/v7/<cwd-basename>-store.json` outside a git repo
 */
export const storePath = async () => {
  try {
    return path.join(await getGitDir(), "gitzy", "retry.json");
  } catch {
    return path.join(
      os.tmpdir(),
      "gitzy",
      "v7",
      `${path.basename(process.cwd())}-store.json`
    );
  }
};

/**
 * Persists the previous commit answers so `--retry` can reuse them
 */
export const saveAnswers = (file: string, data: StoredAnswers) => {
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`;

  fs.mkdirSync(path.dirname(file), { recursive: true });

  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), {
      flag: "wx",
      mode: 0o0600,
    });
    fs.renameSync(tmp, file);
  } catch (error) {
    fs.rmSync(tmp, { force: true });
    throw error;
  }
};

/**
 * Loads the previous commit answers, or `{}` when missing or invalid
 */
export const loadAnswers = (file: string): StoredAnswers => {
  let raw: string;

  try {
    raw = fs.readFileSync(file, "utf-8");
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
