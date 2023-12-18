// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeImport from "../../src/probes/isUnsafeImport.js";

// CONSTANTS
const kWarningUnsafeImport = "unsafe-import";
test("should detect unsafe import", () => {
  const str = "const stream = eval('require')('stream');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeImport)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeImport);
  assert.equal(result.kind, kWarningUnsafeImport);
  assert.equal(result.value, "stream");
});

test("should not detect unsafe import", () => {
  const str = "const stream = eval('fastify')('express');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeImport)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeImport);
  assert.equal(result, undefined);
});
