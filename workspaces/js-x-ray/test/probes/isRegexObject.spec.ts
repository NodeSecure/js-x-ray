// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isRegexObject from "../../src/probes/isRegexObject.ts";
import { getSastAnalysis, parseScript } from "../helpers.ts";

test("should not throw a warning because the given Literal RegExp is considered 'safe'", () => {
  const str = "const foo = new RegExp('^hello');";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRegexObject)
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 0);
});

test("should throw a 'unsafe-regex' warning because the given RegExp Object is unsafe", () => {
  const str = "const foo = new RegExp('(a+){10}');";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRegexObject)
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-regex");
  assert.ok(warning);
  assert.equal(warning.value, "(a+){10}");
});

test("should throw a 'unsafe-regex' warning because the given RegExp Object (with RegExpLiteral) is unsafe", () => {
  const str = "const foo = new RegExp(/(a+){10}/);";
  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isRegexObject)
    .execute(ast.body);

  assert.equal(sastAnalysis.warnings().length, 1);
  const warning = sastAnalysis.getWarning("unsafe-regex");
  assert.ok(warning);
  assert.equal(warning.value, "(a+){10}");
});
