/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/tests/jestSetup.ts"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-community|expo(nent)?|@expo(nent)?|expo-modules-core|@expo/vector-icons|@unimodules|unimodules|sentry-expo|native-base)"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  testMatch: ["<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)"]
};
