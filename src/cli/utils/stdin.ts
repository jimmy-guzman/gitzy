import { text } from "node:stream/consumers";

/**
 * Reads all of stdin and parses it as JSON answers.
 *
 * @throws {Error} When stdin is not valid JSON
 */
export const readStdinJson = async <T>() => {
  const raw = await text(process.stdin);

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Invalid JSON provided to --stdin");
  }
};
