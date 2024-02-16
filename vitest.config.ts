import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude],
    coverage: {
      reporter: ['text', 'html', 'clover', 'json', 'lcovonly'],
      thresholds: {
        branches: 97.95,
        functions: 97.02,
        lines: 98.15,
        statements: 98.4,
      },
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        '**/{interfaces,types,index}.ts',
      ],
    },
  },
})
