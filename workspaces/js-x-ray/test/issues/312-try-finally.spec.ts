// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/312
 */
test("SourceFile inTryStatement must ignore try/finally statements", () => {
  const { dependencies } = new AstAnalyser().analyse(`
    try {
      // do something
    }
    finally {

    }

    var import_ts = __toESM(require("foobar"), 1);
  `);
  assert.strictEqual(dependencies.size, 1);
  assert.ok(dependencies.has("foobar"));

  const dependency = dependencies.get("foobar")!;
  assert.strictEqual(dependency.unsafe, false);
  assert.strictEqual(dependency.inTry, false);
});
