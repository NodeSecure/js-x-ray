// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../../index.js";

test("it should return isOneLineRequire true given a single line CJS export with LogicalExpression assignment", () => {
  const { dependencies, isOneLineRequire } = runASTAnalysis(
    "module.exports = require('fs') || require('constants');"
  );

  assert.ok(isOneLineRequire);
  assert.deepEqual([...dependencies.keys()], ["fs", "constants"]);
});
