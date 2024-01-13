// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysis } from "../../index.js";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/177
 */
test("should detect unsafe-import and unsafe-statement", () => {
  const { warnings, dependencies } = runASTAnalysis(`const help = require('help-me')({
    dir: path.join(__dirname, 'help'),
    ext: '.txt'
  })`);

  assert.strictEqual(warnings.length, 0);
  assert.ok(dependencies.has("help-me"));
  const dependency = dependencies.get("help-me");

  assert.deepEqual(
    dependency,
    {
      unsafe: false,
      inTry: false,
      location: {
        end: {
          column: 31,
          line: 1
        },
        start: {
          column: 13,
          line: 1
        }
      }
    }
  );
});
