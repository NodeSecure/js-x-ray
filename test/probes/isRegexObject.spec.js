// Require Internal Dependencies
import { getSastAnalysis, parseScript, getWarningOnAnalysisResult } from "../utils/index.js";
import isRegexObject from "../../src/probes/isRegexObject.js";

// Require Third-party dependencies
import test from "tape";

test("should not throw a warning because the given Literal RegExp is considered 'safe'", (tape) => {
  const str = "const foo = new RegExp('^hello');";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isRegexObject);

  tape.equal(analysis.warnings.length, 0);

  tape.end();
});

test("should throw a 'unsafe-regex' warning because the given RegExp Object is unsafe", (tape) => {
  const str = "const foo = new RegExp('(a+){10}');";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isRegexObject);

  tape.equal(analysis.warnings.length, 1);
  const result = getWarningOnAnalysisResult(analysis, "unsafe-regex");
  tape.equal(result.value, "(a+){10}");

  tape.end();
});

test("should throw a 'unsafe-regex' warning because the given RegExp Object (with RegExpLiteral) is unsafe", (tape) => {
  const str = "const foo = new RegExp(/(a+){10}/);";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isRegexObject);

  tape.equal(analysis.warnings.length, 1);
  const result = getWarningOnAnalysisResult(analysis, "unsafe-regex");
  tape.equal(result.value, "(a+){10}");

  tape.end();
});
