module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ["node_modules/(?!(jest-)?react-native|@react-native-community|@react-navigation)"],
  moduleDirectories: ["node_modules", "src"],
  modulePaths: ["<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}; 