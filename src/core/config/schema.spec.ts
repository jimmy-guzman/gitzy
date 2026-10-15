// cspell:ignore emojj headr tpye

import { parse } from "valibot";

import { normalizeConfig } from "./normalizer";
import { ConfigSchema, KeyTreeSchema, validateConfig } from "./schema";

type Json =
  | Json[]
  | boolean
  | number
  | string
  | { [key: string]: Json | undefined }
  | null;

const validate = (input: Json) => {
  const output = parse(ConfigSchema, input);

  return validateConfig(
    parse(KeyTreeSchema, input),
    output,
    normalizeConfig(output)
  );
};

describe(validateConfig, () => {
  it("should not warn about a clean config", () => {
    expect(
      validate({
        body: { max: 100, min: 5 },
        header: { max: 50, min: 5 },
        prompts: ["type", "subject", "coAuthors", "signoff"],
        types: [{ emoji: "✨", name: "feat" }, "fix"],
      })
    ).toStrictEqual([]);
  });

  it("should warn about an unknown top-level key", () => {
    expect(validate({ headr: { max: 1 } })).toStrictEqual([
      'Unknown config key "headr"',
    ]);
  });

  it("should warn about an unknown nested key with its path", () => {
    expect(
      validate({
        header: { mx: 50 },
        types: ["fix", { emojj: "✨", name: "feat" }],
      })
    ).toStrictEqual([
      'Unknown config key "header.mx"',
      'Unknown config key "types.1.emojj"',
    ]);
  });

  it("should warn about an unknown prompt name", () => {
    expect(validate({ prompts: ["tpye", "subject"] })).toStrictEqual([
      'Unknown prompt "tpye"',
    ]);
  });

  it("should warn about a negative length", () => {
    expect(validate({ branch: { max: -1 } })).toStrictEqual([
      "branch.max must not be negative (got -1)",
    ]);
  });

  it("should warn about a min above its max", () => {
    expect(validate({ body: { max: 10, min: 20 } })).toStrictEqual([
      "body.min (20) is greater than body.max (10)",
    ]);
  });

  it("should compare against the default max when only min is set", () => {
    expect(validate({ header: { min: 100 } })).toStrictEqual([
      "header.min (100) is greater than header.max (64)",
    ]);
  });
});
