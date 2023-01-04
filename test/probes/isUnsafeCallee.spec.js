// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import isUnsafeCallee from "../../src/probes/isUnsafeCallee.js";

// CONSTANTS
const kWarningUnsafeStmt = "unsafe-stmt";

test("should detect eval", (tape) => {
  const str = "eval(\"this\");";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCallee)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  tape.equal(result.kind, kWarningUnsafeStmt);
  tape.equal(result.value, "eval");

  tape.end();
});

test("should detect Function", (tape) => {
  const str = "Function(\"return this\")()";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCallee)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  tape.equal(result.kind, kWarningUnsafeStmt);
  tape.equal(result.value, "Function");

  tape.end();
});

test("should not detect Function", (tape) => {
  const str = "Function('foo');";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isUnsafeCallee)
    .execute(ast.body);

  const result = sastAnalysis.getWarning(kWarningUnsafeStmt);
  tape.equal(result, undefined);

  tape.end();
});
