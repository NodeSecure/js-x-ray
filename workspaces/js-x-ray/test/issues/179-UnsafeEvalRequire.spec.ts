// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser, DefaultCollectableSet, type Dependency } from "../../src/index.ts";
import { extractDependencies } from "../helpers.ts";

/**
 * @see https://github.com/NodeSecure/js-x-ray/issues/179
 */
// CONSTANTS
const kIncriminedCodeSample = "const stream = eval('require')('stream');";
const kWarningUnsafeImport = "unsafe-import";
const kWarningUnsafeStatement = "unsafe-stmt";

test("should detect unsafe-import and unsafe-statement", () => {
  const dependencySet = new DefaultCollectableSet<Dependency>("dependency");
  const sastAnalysis = new AstAnalyser({
    collectables: [dependencySet]
  }).analyse(kIncriminedCodeSample);

  const [firstWarning, secondWarning] = sastAnalysis.warnings;

  const dependencies = extractDependencies(dependencySet);

  assert.equal(firstWarning.value, "stream");
  assert.equal(firstWarning.kind, kWarningUnsafeImport);
  assert.equal(secondWarning.value, "eval");
  assert.equal(secondWarning.kind, kWarningUnsafeStatement);
  assert.equal(sastAnalysis.warnings.length, 2);
  assert.equal(dependencies.has("stream"), true);
  assert.equal(dependencies.get("stream")!.unsafe, true);
  assert.equal(dependencies.size, 1);
});
