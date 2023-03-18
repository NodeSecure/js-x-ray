// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript, mockedFunction } from "../utils/index.js";
import isArrayExpression from "../../src/probes/isArrayExpression.js";

test("it should trigger analyzeLiteral method one time", () => {
  const str = "['foo']";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  const analyzeLiteralMock = mockedFunction();
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  assert.strictEqual(sastAnalysis.warnings().length, 0);

  assert.ok(analyzeLiteralMock.haveBeenCalledTimes(1));
  const literalNode = analyzeLiteralMock.at(0);
  assert.strictEqual(literalNode.value, "foo");
});

test("it should trigger analyzeLiteral method two times (ignoring the holey between)", () => {
  const str = "[5, ,10]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  const analyzeLiteralMock = mockedFunction();
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  assert.ok(analyzeLiteralMock.haveBeenCalledTimes(2));
  assert.strictEqual(analyzeLiteralMock.at(0).value, 5);
  assert.strictEqual(analyzeLiteralMock.at(2).value, 10);
});

test("it should trigger analyzeLiteral one time (ignoring non-literal Node)", () => {
  const str = "[5, () => void 0]";

  const ast = parseScript(str);
  const sastAnalysis = getSastAnalysis(str, isArrayExpression);

  const analyzeLiteralMock = mockedFunction();
  sastAnalysis.analysis.analyzeLiteral = analyzeLiteralMock.callback.bind(analyzeLiteralMock);
  sastAnalysis.execute(ast.body);

  assert.ok(analyzeLiteralMock.haveBeenCalledTimes(1));
  assert.strictEqual(analyzeLiteralMock.at(0).value, 5);
});
