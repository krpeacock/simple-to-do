module.exports = {
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["test/integration"],
  moduleNameMapper: {
    "ic:canisters/simple_to_do":
      "<rootDir>/.dfx/local/canisters/simple_to_do/simple_to_do.js",
    "ic:idl/simple_to_do":
      "<rootDir>/.dfx/local/canisters/simple_to_do/simple_to_do.did.js",
  },
};
