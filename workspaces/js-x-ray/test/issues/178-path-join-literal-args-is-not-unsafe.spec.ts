// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser, DefaultCollectableSet, type Dependency } from "../../src/index.ts";
import { extractDependencies } from "../helpers.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/178
 */
const validTestCases = [
  "const bin = require(path.join('..', './bin.js'));",
  "const bin = require.resolve(path.join('..', './bin.js'));"
];

test("should not detect unsafe-import for path.join if every argument is a string literal", () => {
  validTestCases.forEach((test) => {
    const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
    const { warnings } = new AstAnalyser({
      collectables: [dependencySet]
    }).analyse(test);

    assert.strictEqual(warnings.length, 0);
    assert.ok(extractDependencies(dependencySet).has("../bin.js"));
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
