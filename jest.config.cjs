/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",

  testMatch: ["<rootDir>/tests/**/*.spec.ts"],

  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "<rootDir>/tsconfig.jest.json" }]
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};
