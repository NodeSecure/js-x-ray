// Require Internal Dependencies
import { getSastAnalysis, parseScript, getWarningOnAnalysisResult } from "../utils/index.js";
import isLiteralRegex from "../../src/probes/isLiteralRegex.js";

// Require Third-party dependencies
import test from "tape";

test("should throw a 'unsafe-regex' warning because the given RegExp Literal is unsafe", (tape) => {
  const str = "const foo = /(a+){10}/g;";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isLiteralRegex);

  tape.equal(analysis.warnings.length, 1);
  const result = getWarningOnAnalysisResult(analysis, "unsafe-regex");
  tape.equal(result.value, "(a+){10}");

  tape.end();
});
