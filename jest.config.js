module.exports = {
  testMatch: ['**/?(*.)+(spec|test).[t]s'],
  testPathIgnorePatterns: ['/node_modules/', 'dist'], //
  testTimeout: 300000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  resetMocks: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  //globalSetup: './src/global-test-setup.ts', // will be called once before all tests are executed
  globalTeardown: './src/test-setup.ts', // will be called once after all tests are executed
};
