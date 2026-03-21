// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.ts";
import { getSastAnalysis, parseScript } from "../helpers.ts";

// CONSTANTS
const kWarningUnsafeStmt = "unsafe-stmt";

describe("isUnsafeCallee probe", () => {
  it("should detect eval", () => {
    const str = "eval(\"this\");";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
    assert.ok(result);
    assert.equal(result.kind, kWarningUnsafeStmt);
    assert.equal(result.value, "eval");
  });

  it("should not detect warnings for Function with return this", () => {
    const str = "Function(\"return this\")()";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    assert.strictEqual(sastAnalysis.warnings.length, 0);
  });

  it("should detect for unsafe Function statement", () => {
    const str = "Function(\"anything in here\")()";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
    assert.ok(result);
    assert.equal(result.kind, kWarningUnsafeStmt);
    assert.equal(result.value, "Function");
  });

  it("should not detect Function", () => {
    const str = "Function('foo');";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
    assert.equal(result, undefined);
  });
});
