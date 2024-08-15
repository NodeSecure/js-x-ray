// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../index.js";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/180
 */
test("should detect required core 'http' with a LogicalExpr containing Function('return this')()", () => {
  const { warnings, dependencies } = new AstAnalyser().analyse(`
    var root = freeGlobal || freeSelf || Function('return this')();
    const foo = root.require;
    foo("http");
  `);

  assert.strictEqual(warnings.length, 0);
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("http"));
});
