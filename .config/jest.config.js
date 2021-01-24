module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['node_modules', 'index.ts'],
  coverageThreshold: {
    global: {
      branches: 57.28,
      functions: 71.29,
      lines: 71.48,
      statements: 72.38,
    },
  },
  preset: 'ts-jest',
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist/'],
}
