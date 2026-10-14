import {
  array,
  boolean,
  object,
  partial,
  pipe,
  string,
  transform,
  union,
} from "valibot";

/**
 * Splits a comma-separated list, trimming items and dropping empty ones
 */
export const splitList = (raw = "") =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const StringListSchema = union([
  array(string()),
  pipe(
    string(),
    transform((value) => splitList(value))
  ),
]);

/**
 * Validates message parts coming from outside the process (stdin, the retry store)
 */
export const PartialMessagePartsSchema = partial(
  object({
    body: string(),
    breaking: union([boolean(), string()]),
    coAuthors: StringListSchema,
    issues: StringListSchema,
    scope: string(),
    signoff: union([boolean(), string()]),
    subject: string(),
    type: string(),
  })
);
