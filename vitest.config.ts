import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude],
    coverage: {
      reporter: ["text", "html", "clover", "json", "lcovonly"],
      thresholds: {
        branches: 97.92,
        functions: 97,
        lines: 98.15,
        statements: 98.28,
      },
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "**/{interfaces,types,index}.ts",
      ],
    },
  },
});
