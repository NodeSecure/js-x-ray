// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/283
test("Given a one line require (with no module.exports) then isOneLineRequire must equal true", () => {
  const { flags } = new AstAnalyser().analyse("require('foo.js');");

  assert.ok(flags.has("oneline-require"));
});

test("Given an empty code then isOneLineRequire must equal false", () => {
  const { flags } = new AstAnalyser().analyse("");

  assert.strictEqual(flags.has("oneline-require"), false);
});
