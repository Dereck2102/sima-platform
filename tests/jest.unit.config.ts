import type { Config } from 'jest';

const config: Config = {
  displayName: 'unit-tests',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/unit/**/*.spec.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../coverage/unit',
  collectCoverageFrom: [
    '../apps/**/src/**/*.ts',
    '../libs/**/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@sima/domain$': '<rootDir>/../libs/shared/domain/src/index.ts',
    '^@sima-platform/auth-lib$': '<rootDir>/../libs/shared/auth-lib/src/index.ts',
  },
};

export default config;
