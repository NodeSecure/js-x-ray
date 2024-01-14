// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isArrayExpression from "../../src/probes/isArrayExpression.js";

test("it should trigger analyzeLiteral method one time", (t) => {
  const str = "['foo']";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  t.mock.method(sastAnalysis.analysis, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);

  const calls = sastAnalysis.analysis.analyzeLiteral.mock.calls;
  assert.strictEqual(calls.length, 1);

  const literalNode = calls[0].arguments[0];
  assert.strictEqual(literalNode.value, "foo");
});

test("it should trigger analyzeLiteral method two times (ignoring the holey between)", (t) => {
  const str = "[5, ,10]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  t.mock.method(sastAnalysis.analysis, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  const calls = sastAnalysis.analysis.analyzeLiteral.mock.calls;
  assert.strictEqual(calls.length, 2);
  assert.strictEqual(calls[0].arguments[0].value, 5);
  assert.strictEqual(calls[1].arguments[0].value, 10);
});

test("it should trigger analyzeLiteral one time (ignoring non-literal Node)", (t) => {
  const str = "[5, () => void 0]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  t.mock.method(sastAnalysis.analysis, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  const calls = sastAnalysis.analysis.analyzeLiteral.mock.calls;
  assert.strictEqual(calls.length, 1);

  const literalNode = calls[0].arguments[0];
  assert.strictEqual(literalNode.value, 5);
});
