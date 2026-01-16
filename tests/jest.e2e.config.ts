import type { Config } from 'jest';

const config: Config = {
  displayName: 'e2e-tests',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/e2e/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../coverage/e2e',
  // E2E tests run sequentially to avoid port conflicts
  maxWorkers: 1,
  testTimeout: 30000,
  moduleNameMapper: {
    '^@sima/domain$': '<rootDir>/../libs/shared/domain/src/index.ts',
    '^@sima-platform/auth-lib$': '<rootDir>/../libs/shared/auth-lib/src/index.ts',
  },
};

export default config;
