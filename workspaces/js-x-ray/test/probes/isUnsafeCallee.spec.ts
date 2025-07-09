// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.js";

// CONSTANTS
const kWarningUnsafeStmt = "unsafe-stmt";

test("should detect eval", () => {
  const str = "eval(\"this\");";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCallee)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  assert.equal(result.kind, kWarningUnsafeStmt);
  assert.equal(result.value, "eval");
});

test("should not detect warnings for Function with return this", () => {
  const str = "Function(\"return this\")()";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCallee)
    .execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings.length, 0);
});

test("should detect for unsafe Function statement", () => {
  const str = "Function(\"anything in here\")()";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCallee)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  assert.equal(result.kind, kWarningUnsafeStmt);
  assert.equal(result.value, "Function");
});

test("should not detect Function", () => {
  const str = "Function('foo');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isUnsafeCallee)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  assert.equal(result, undefined);
});
