module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['node_modules', 'index.ts'],
  coverageThreshold: {
    global: {
      branches: 97.3,
      functions: 96.55,
      lines: 97.28,
      statements: 97.67,
    },
  },
  preset: 'ts-jest',
  restoreMocks: true,
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist/'],
}
