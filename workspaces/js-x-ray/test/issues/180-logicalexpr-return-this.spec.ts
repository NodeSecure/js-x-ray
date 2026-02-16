// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser, DefaultCollectableSet, type Dependency } from "../../src/index.ts";
import { extractDependencies } from "../helpers.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/180
 */
test("should detect required core 'http' with a LogicalExpr containing Function('return this')()", () => {
  const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
  const { warnings } = new AstAnalyser({
    collectables: [dependencySet]
  }).analyse(`
    var root = freeGlobal || freeSelf || Function('return this')();
    const foo = root.require;
    foo("http");
  `);

  const dependencies = extractDependencies(dependencySet);

  assert.strictEqual(warnings.length, 0);
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});
