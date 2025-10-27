import * as v from "valibot";

import { defaultConfig } from "@/defaults/config";

import { validateConfig, validateUserConfig } from "./validate";

vi.mock("valibot", async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- this is okay
  const actual = await vi.importActual<typeof import("valibot")>("valibot");

  return {
    ...actual,
    parseAsync: vi.fn(actual.parseAsync),
  };
});

describe("validateConfig", () => {
  it("should return unknown or additional properties detected", async () => {
    await expect(validateConfig({ yellow: "banana" })).resolves
      .toMatchInlineSnapshot(`
      "× Invalid key: Expected never but received "yellow"
        → at yellow"
    `);
  });

  it("should return invalid configuration", async () => {
    await expect(validateConfig(1)).resolves.toMatchInlineSnapshot(
      `"× Invalid type: Expected Object but received 1"`,
    );
  });

  it("should return true if all validations pass", async () => {
    await expect(validateConfig(defaultConfig)).resolves.toBe(true);
  });

  it("should return fallback error when validation fails unexpectedly", async () => {
    vi.spyOn(v, "parseAsync").mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    await expect(validateConfig(defaultConfig)).resolves.toBe(
      "invalid configuration",
    );
  });
});

describe("validateUserConfig", () => {
  it("should throw if config is invalid", async () => {
    await expect(validateUserConfig({ yellow: "banana" })).rejects.toThrow(
      '× Invalid key: Expected never but received "yellow"\n  → at yellow',
    );
  });

  it("should return true if config is valid", async () => {
    await expect(validateUserConfig({ disableEmoji: true })).resolves.toBe(
      true,
    );
  });
});
