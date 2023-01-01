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
