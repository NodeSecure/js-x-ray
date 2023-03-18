// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";

test("it should not crash even if module 'false' is provided (import keyword)", () => {
  runASTAnalysis("import * as foo from \"foo\";", {
    module: false
  });
});

test("it should not crash even if module 'false' is provided (export keyword)", () => {
  runASTAnalysis("export const foo = 5;", {
    module: false
  });
});

test("it should be capable to extract dependencies name for ECMAScript Modules (ESM)", () => {
  const { dependencies, warnings } = runASTAnalysis(`
    import * as http from "http";
    import fs from "fs";
    import { foo } from "xd";
  `, { module: true });

  assert.strictEqual(warnings.length, 0);
  assert.deepEqual(
    [...dependencies].sort(),
    ["http", "fs", "xd"].sort()
  );
});
