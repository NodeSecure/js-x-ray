// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../../index.js";

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/283
test("Given a one line require (with no module.exports) then isOneLineRequire must equal true", () => {
  const { isOneLineRequire } = runASTAnalysis(`require('foo.js');`);

  assert.ok(isOneLineRequire);
});

test("Given an empty code then isOneLineRequire must equal false", () => {
  const { isOneLineRequire } = runASTAnalysis(``);

  assert.strictEqual(isOneLineRequire, false);
});
