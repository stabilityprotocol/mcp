module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'Core',
      testMatch: ['<rootDir>/packages/core/tests/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/packages/core/tests/setup.ts']
    },
    {
      displayName: 'Wallet',
      testMatch: ['<rootDir>/packages/wallet/tests/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/packages/wallet/tests/setup.ts']
    },
    {
      displayName: 'Contracts',
      testMatch: ['<rootDir>/packages/contracts/tests/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/packages/contracts/tests/setup.ts']
    },
    {
      displayName: 'Blockchain',
      testMatch: ['<rootDir>/packages/blockchain/tests/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/packages/blockchain/tests/setup.ts']
    }
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};