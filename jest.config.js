export default {
  preset: 'ts-jest/presets/default-esm',  // Use TypeScript with ES modules
  extensionsToTreatAsEsm: ['.ts'],        // Treat .ts files as ES modules
  testEnvironment: 'node',                // Node.js environment for CLI testing
  roots: ['<rootDir>/src', '<rootDir>/tests'], // Where to look for tests
  testMatch: [                            // Test file patterns
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [                  // Files to include in coverage
    'src/**/*.ts',
    '!src/**/*.d.ts'                     // Exclude type definition files
  ],
  coverageDirectory: 'coverage',          // Coverage reports location
  coverageReporters: ['text', 'lcov', 'html'], // Coverage report formats
  moduleNameMapping: {                    // Handle path mapping
    '^@/(.*)$': '<rootDir>/src/$1'       // Allow @/ imports for src/
  },
  globals: {
    'ts-jest': {
      useESM: true                        // Enable ES modules in ts-jest
    }
  }
};