module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['node_modules', 'index.ts'],
  coverageThreshold: {
    global: {
      branches: 97.98,
      functions: 97.5,
      lines: 98.15,
      statements: 98.4,
    },
  },
  preset: 'ts-jest',
  restoreMocks: true,
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist/'],
}
