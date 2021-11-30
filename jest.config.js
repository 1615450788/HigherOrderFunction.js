module.exports = {
  // A list of paths to directories that Jest should use to search for files in
  // https://jestjs.io/docs/configuration#roots-arraystring
  roots: ["<rootDir>/src/"],

  // Jest transformations
  // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transform TypeScript files using ts-jest
  },

  // Code coverage config
  // https://jestjs.io/docs/configuration#collectcoveragefrom-array
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage/",
  // collectCoverageFrom: ["<rootDir>/src/**/*.{ts,tsx}"],

  // Important: order matters, specific rules should be defined first
  // https://jestjs.io/fr/docs/configuration#modulenamemapper-objectstring-string--arraystring
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle TypeScript path aliases
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
