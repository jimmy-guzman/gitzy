import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "**/{interfaces,types,index}.ts",
      ],
      reporter: ["text", "html", "clover", "json", "lcovonly"],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    exclude: [...configDefaults.exclude],
    globals: true,
  },
});
