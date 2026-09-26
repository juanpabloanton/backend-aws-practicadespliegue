/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  // Los imports del código fuente terminan en .js (ESM); Jest debe resolverlos al .ts real.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
