module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};