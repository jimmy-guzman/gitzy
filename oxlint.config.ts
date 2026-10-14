import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  env: core.env,
  extends: [core, antiSlop, vitest],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      files: ["src/**"],
      rules: {
        "import/no-relative-parent-imports": "error",
      },
    },
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
