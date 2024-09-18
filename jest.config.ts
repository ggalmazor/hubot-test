export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: "node",
  transform: {
    '\\.ts$': ['ts-jest', {useESM: true}],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\\\.mjs$)'
  ]
};