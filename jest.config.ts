export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['ormconfig.ts', 'test/entities', 'sample/entities'],
}