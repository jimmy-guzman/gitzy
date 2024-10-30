import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude],
    coverage: {
      reporter: ["text", "html", "clover", "json", "lcovonly"],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "**/{interfaces,types,index}.ts",
      ],
    },
  },
});
