// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isRegexObject from "../../src/probes/isRegexObject.js";

test("should not throw a warning because the given Literal RegExp is considered 'safe'", (tape) => {
  const str = "const foo = new RegExp('^hello');";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isRegexObject)
    .execute(ast.body);

  tape.equal(sastAnalysis.warnings().length, 0);

  tape.end();
});

test("should throw a 'unsafe-regex' warning because the given RegExp Object is unsafe", (tape) => {
  const str = "const foo = new RegExp('(a+){10}');";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isRegexObject)
    .execute(ast.body);

  tape.equal(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-regex");
  tape.equal(warning.value, "(a+){10}");

  tape.end();
});

test("should throw a 'unsafe-regex' warning because the given RegExp Object (with RegExpLiteral) is unsafe", (tape) => {
  const str = "const foo = new RegExp(/(a+){10}/);";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isRegexObject)
    .execute(ast.body);

  tape.equal(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-regex");
  tape.equal(warning.value, "(a+){10}");

  tape.end();
});
