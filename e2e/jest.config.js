module.exports = {
  collectCoverageFrom: ['e2e/**/*.ts'],
  coveragePathIgnorePatterns: ['node_modules'],
  preset: 'ts-jest',
  restoreMocks: true,
  rootDir: process.cwd(),
  roots: ['<rootDir>/e2e'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'dist/'],
}
