import type { Config } from '@jest/types';

import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.paths.json';

const config: Config.InitialOptions = {
  verbose: true,
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.service.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
  moduleDirectories: ['<rootDir>/src', '<rootDir>/test', 'node_modules'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  modulePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/dist/'],
  setupFiles: ['<rootDir>/test/set-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/test-setup.ts'],
};

export default config;
