// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeImport from "../../src/probes/isUnsafeEvalRequire.js";
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.js";

// CONSTANTS
const kWarningUnsafeImport = "unsafe-import";
const kWarningUnsafeStmt = "unsafe-stmt";
test("should detect unsafe import", () => {
  const str = "const stream = eval('require')('stream');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeImport)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeImport);
  assert.equal(result.kind, kWarningUnsafeImport);
  assert.equal(result.value, "stream");
  assert.equal(sastAnalysis.analysis.warnings.length, 1);
});

test("should detect unsafe statement", () => {
  const str = "const stream = eval('require')('stream');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCallee)
    .execute(ast.body);
  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  assert.equal(result.kind, kWarningUnsafeStmt);
  assert.equal(result.value, "eval");
  assert.equal(sastAnalysis.analysis.warnings.length, 1);
});

test("should not detect unsafe import", () => {
  const str = "const stream = eval('fastify')('express');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeImport)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeImport);
  assert.equal(result, undefined);
  assert.equal(sastAnalysis.analysis.warnings.length, 0);
});
