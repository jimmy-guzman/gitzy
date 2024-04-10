import { access, unlinkSync, writeFile } from "node:fs";

import { getSearchPlaces, loadConfig } from "./loadConfig";

const expectedSearchPlaces = [
  "package.json",
  ".gitzyrc",
  ".gitzyrc.json",
  ".gitzyrc.yaml",
  ".gitzyrc.yml",
  ".gitzyrc.js",
  ".gitzyrc.cjs",
  "gitzy.config.js",
  "gitzy.config.cjs",
  ".config/.gitzyrc",
  ".config/.gitzyrc.json",
  ".config/.gitzyrc.yaml",
  ".config/.gitzyrc.yml",
  ".config/.gitzyrc.js",
  ".config/.gitzyrc.cjs",
  ".config/gitzy.config.js",
  ".config/gitzy.config.cjs",
];

describe("searchPlaces", () => {
  afterEach(() => {
    access("./.arc.json", (error) => {
      if (!error) {
        unlinkSync(".arc.json");
      }
    });
    access("./.arc.yml", (error) => {
      if (!error) {
        unlinkSync(".arc.yml");
      }
    });
  });
  it("should return all search places", () => {
    expect(getSearchPlaces("gitzy")).toStrictEqual(expectedSearchPlaces);
  });
  it("should return null if no config is found", async () => {
    const config = await loadConfig("a");

    expect(config).toBeNull();
  });

  it("should return config for json files", async () => {
    writeFile(".arc.json", JSON.stringify({ disableEmoji: true }), (error) => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (error) throw error;
    });

    const config = await loadConfig("a");

    expect(config).toStrictEqual({
      config: { disableEmoji: true },
      filepath: `${process.cwd()}/.arc.json`,
    });
  });
  it("should return config for yaml files", async () => {
    writeFile(".arc.yml", "disableEmoji: true", (error) => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (error) throw error;
    });

    const config = await loadConfig("a");

    expect(config).toStrictEqual({
      config: { disableEmoji: true },
      filepath: `${process.cwd()}/.arc.yml`,
    });
  });
});
