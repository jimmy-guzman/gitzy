module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['node_modules', 'index.ts'],
  coverageThreshold: {
    global: {
      branches: 93.72,
      functions: 90,
      lines: 84.07,
      statements: 86.29,
    },
  },
  preset: 'ts-jest',
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist/'],
}
