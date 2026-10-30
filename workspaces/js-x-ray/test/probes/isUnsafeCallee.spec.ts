// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.ts";
import { AstAnalyser } from "../../src/index.ts";
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

  it("should detect for unsafe new Function statement", () => {
    const str = "new Function(\"anything in here\")()";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
    assert.ok(result);
    assert.equal(result.kind, kWarningUnsafeStmt);
    assert.equal(result.value, "Function");
  });

  it("should not detect warnings for new Function with return this", () => {
    const str = "new Function(\"return this\")()";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    assert.strictEqual(sastAnalysis.warnings.length, 0);
  });

  it("should not detect new Function without calling it", () => {
    const str = "new Function('foo');";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
    assert.equal(result, undefined);
  });

  it("should not detect Function", () => {
    const str = "Function('foo');";

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isUnsafeCallee)
      .execute(ast.body);

    const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
    assert.equal(result, undefined);
  });

  describe("with AstAnalyser pipelines", () => {
    for (const code of ["Function(code)();", "new Function(code)();"]) {
      it(`should detect ${code}`, () => {
        const { warnings } = new AstAnalyser().analyse(code);

        const result = warnings.find((warning) => warning.kind === kWarningUnsafeStmt);
        assert.ok(result);
        assert.equal(result.value, "Function");
      });
    }
  });
});
