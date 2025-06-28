// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/179
 */
// CONSTANTS
const kIncriminedCodeSample = "const stream = eval('require')('stream');";
const kWarningUnsafeImport = "unsafe-import";
const kWarningUnsafeStatement = "unsafe-stmt";

test("should detect unsafe-import and unsafe-statement", () => {
  const sastAnalysis = new AstAnalyser().analyse(kIncriminedCodeSample);

  assert.equal(sastAnalysis.warnings.at(0).value, "stream");
  assert.equal(sastAnalysis.warnings.at(0).kind, kWarningUnsafeImport);
  assert.equal(sastAnalysis.warnings.at(1).value, "eval");
  assert.equal(sastAnalysis.warnings.at(1).kind, kWarningUnsafeStatement);
  assert.equal(sastAnalysis.warnings.length, 2);
  assert.equal(sastAnalysis.dependencies.has("stream"), true);
  assert.equal(sastAnalysis.dependencies.get("stream").unsafe, true);
  assert.equal(sastAnalysis.dependencies.size, 1);
});
