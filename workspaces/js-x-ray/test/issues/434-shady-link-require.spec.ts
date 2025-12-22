// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

// Regression test for https://github.com/NodeSecure/js-x-ray/issues/434
test("it should not return shady-link warning", () => {
  const { warnings } = new AstAnalyser().analyse(`
    var debug = require('debug')('express:view');
  `);

  assert.strictEqual(warnings.length, 0);
});

