/**
 * Jest configuration for integration tests
 */
import type { Config } from 'jest';

const config: Config = {
  displayName: 'integration-tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tests/tsconfig.spec.json',
    }],
  },
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  // Don't fail on missing tests
  passWithNoTests: true,
};

export default config;
