/**
 * Jest Configuration
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  // Test environment
  testEnvironment: "jsdom",
  
  // Setup files for testing library matchers
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  
  // TypeScript and JSX transformation
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx"
      }
    }],
  },
  
  // Module path mapping for aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  
  // File extensions Jest will process
  moduleFileExtensions: [
    "ts",
    "tsx", 
    "js",
    "jsx",
    "json"
  ],
  
  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js|jsx)",
    "**/*.(test|spec).(ts|tsx|js|jsx)"
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "\\.mock\\.ts$"
  ],

  // Coverage settings
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Ignore node_modules except for packages that need transformation
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$))"
  ]
};

export default config;