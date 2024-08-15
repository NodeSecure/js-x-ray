// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../index.js";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/178
 */
const validTestCases = [
  "const bin = require(path.join('..', './bin.js'));",
  "const bin = require.resolve(path.join('..', './bin.js'));"
];

test("should not detect unsafe-import for path.join if every argument is a string literal", () => {
  validTestCases.forEach((test) => {
    const { warnings, dependencies } = new AstAnalyser().analyse(test);

    assert.strictEqual(warnings.length, 0);
    assert.ok(dependencies.has("../bin.js"));
  });
});

const invalidTestCases = [
  "const bin = require(path.join(__dirname, '..', './bin.js'));",
  "const bin = require(path.join(3, '..', './bin.js'));",
  "const bin = require.resolve(path.join(__dirname, '..', './bin.js'));",
  "const bin = require.resolve(path.join(3, '..', './bin.js'));"
];

test("should detect unsafe-import of path.join if not every argument is a string literal", () => {
  invalidTestCases.forEach((test) => {
    const { warnings } = new AstAnalyser().analyse(test);

    assert.strictEqual(warnings.length, 1);
  });
});
