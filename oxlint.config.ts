import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, vitest],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      files: ["**/*.spec.ts"],
      plugins: ["vitest"],
      rules: {
        "vitest/consistent-test-filename": [
          "error",
          { pattern: String.raw`.*\.spec\.[tj]sx?$` },
        ],
        "vitest/no-importing-vitest-globals": "error",
        "vitest/prefer-importing-vitest-globals": "off",
      },
    },
  ],
});
