// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

// CONSTANTS
const kFixtureURL = new URL("../fixtures/issues/", import.meta.url);

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/442
test("should not crash when analysing the stringify source code", () => {
  const stringifyCode = readFileSync(new URL("stringify.js", kFixtureURL), "utf-8");
  new AstAnalyser().analyse(stringifyCode);
});

