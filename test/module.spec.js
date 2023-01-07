// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { runASTAnalysis } from "../index.js";

test("it should not crash even if module 'false' is provided", (tape) => {
  runASTAnalysis("import * as foo from \"foo\";", {
    module: false
  });

  tape.end();
});

test("it should be capable to extract dependencies name for ECMAScript Modules (ESM)", (tape) => {
  const { dependencies, warnings } = runASTAnalysis(`
    import * as http from "http";
    import fs from "fs";
    import { foo } from "xd";
  `, { module: true });

  tape.strictEqual(warnings.length, 0);
  tape.deepEqual([...dependencies].sort(), ["http", "fs", "xd"].sort());

  tape.end();
});
