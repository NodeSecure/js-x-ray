// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

// CONSTANTS
const kFixtureURL = new URL("../fixtures/issues/", import.meta.url);

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/59
test("it should not crash for prop-types", () => {
  const propTypes = readFileSync(
    new URL("prop-types.min.js", kFixtureURL),
    "utf-8"
  );
  new AstAnalyser().analyse(propTypes);
});
