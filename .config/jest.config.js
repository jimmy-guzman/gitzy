module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['node_modules', 'index.ts'],
  coverageThreshold: {
    global: {
      branches: 97.32,
      functions: 96.64,
      lines: 97.59,
      statements: 97.92,
    },
  },
  preset: 'ts-jest',
  restoreMocks: true,
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist/'],
}
