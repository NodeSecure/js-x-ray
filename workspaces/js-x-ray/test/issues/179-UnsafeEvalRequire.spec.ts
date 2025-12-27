// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/179
 */
// CONSTANTS
const kIncriminedCodeSample = "const stream = eval('require')('stream');";
const kWarningUnsafeImport = "unsafe-import";
const kWarningUnsafeStatement = "unsafe-stmt";

test("should detect unsafe-import and unsafe-statement", () => {
  const sastAnalysis = new AstAnalyser().analyse(kIncriminedCodeSample);

  const [firstWarning, secondWarning] = sastAnalysis.warnings;

  assert.equal(firstWarning.value, "stream");
  assert.equal(firstWarning.kind, kWarningUnsafeImport);
  assert.equal(secondWarning.value, "eval");
  assert.equal(secondWarning.kind, kWarningUnsafeStatement);
  assert.equal(sastAnalysis.warnings.length, 2);
  assert.equal(sastAnalysis.dependencies.has("stream"), true);
  assert.equal(sastAnalysis.dependencies.get("stream")!.unsafe, true);
  assert.equal(sastAnalysis.dependencies.size, 1);
});
