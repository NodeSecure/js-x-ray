// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import isArrayExpression from "../../src/probes/isArrayExpression.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

test("it should trigger analyzeLiteral method one time", (t) => {
  const str = "['foo']";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isArrayExpression);

  const analyzeLiteralMock = t.mock.method(sastAnalysis.sourceFile, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);

  const calls = analyzeLiteralMock.mock.calls;
  assert.strictEqual(calls.length, 1);

  const literalNode = calls[0].arguments[0];
  assert.strictEqual(literalNode.value, "foo");
});

test("it should trigger analyzeLiteral method two times (ignoring the holey between)", (t) => {
  const str = "[5, ,10]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isArrayExpression);

  const analyzeLiteralMock = t.mock.method(sastAnalysis.sourceFile, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  const calls = analyzeLiteralMock.mock.calls;
  assert.strictEqual(calls.length, 2);
  assert.strictEqual(calls[0].arguments[0].value, 5);
  assert.strictEqual(calls[1].arguments[0].value, 10);
});

test("it should trigger analyzeLiteral one time (ignoring non-literal Node)", (t) => {
  const str = "[5, () => void 0]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(isArrayExpression);

  const analyzeLiteralMock = t.mock.method(sastAnalysis.sourceFile, "analyzeLiteral");
  sastAnalysis.execute(ast.body);

  const calls = analyzeLiteralMock.mock.calls;
  assert.strictEqual(calls.length, 1);

  const literalNode = calls[0].arguments[0];
  assert.strictEqual(literalNode.value, 5);
});
