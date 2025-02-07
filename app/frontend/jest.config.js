module.exports = {
  // The root directory that Jest should scan for tests and modules
  roots: ['<rootDir>/src'],

  // File extensions Jest should look for
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', ],

  // Test environment setup
  testEnvironment: 'jsdom',

  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Setup files to run before each test
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],

  // Transform files with specific extensions using babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module name mapper for handling static assets
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js'
  },

  // This tells Jest where to look for mock files
  moduleDirectories: ['node_modules', 'src'],

  // Test paths to ignore
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],


  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}