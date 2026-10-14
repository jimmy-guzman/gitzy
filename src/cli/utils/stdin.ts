import { text } from "node:stream/consumers";

import type { GenericSchema } from "valibot";
import { parseJson, pipe, safeParse, string, summarize } from "valibot";

/**
 * Reads all of stdin as JSON and validates it against the given schema.
 *
 * @throws {Error} When stdin is not valid JSON or does not match the schema
 */
export const readStdinJson = async <const TSchema extends GenericSchema>(
  schema: TSchema
) => {
  const parsed = safeParse(
    pipe(string(), parseJson(), schema),
    await text(process.stdin)
  );

  if (!parsed.success) {
    throw new Error(
      `Invalid answers provided to --stdin\n${summarize(parsed.issues)}`
    );
  }

  return parsed.output;
};
