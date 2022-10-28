// Require Internal Dependencies
import { parseScript, getSastAnalysis, getWarningOnAnalysisResult } from "../utils/index.js";
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.js";

// Require Third-party dependencies
import test from "tape";

// CONSTANTS
const kWarningUnsafeStmt = "unsafe-stmt";

test("should detect eval", (tape) => {
  const str = "eval(\"this\");";

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isUnsafeCallee);

  const result = getWarningOnAnalysisResult(analysis, kWarningUnsafeStmt);
  tape.equal(result.kind, kWarningUnsafeStmt);
  tape.equal(result.value, "eval");
  tape.end();
});

test("should detect Function", (tape) => {
  const str = "Function(\"return this\")()";

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isUnsafeCallee);

  const result = getWarningOnAnalysisResult(analysis, kWarningUnsafeStmt);
  tape.equal(result.kind, kWarningUnsafeStmt);
  tape.equal(result.value, "Function");
  tape.end();
});

test("should not detect Function", (tape) => {
  const str = "Function('foo');";

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isUnsafeCallee);

  const result = getWarningOnAnalysisResult(analysis, kWarningUnsafeStmt);
  tape.equal(result, undefined);
  tape.end();
});
