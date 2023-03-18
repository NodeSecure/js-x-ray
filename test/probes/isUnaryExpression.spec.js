// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isUnaryExpression from "../../src/probes/isUnaryExpression.js";

test("should detect one UnaryArray", () => {
  const str = "!![]";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isUnaryExpression)
    .execute(ast.body);

  assert.strictEqual(analysis.counter.doubleUnaryArray, 1);
});

test("should not detect any UnaryArray", () => {
  const str = "![]";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isUnaryExpression)
    .execute(ast.body);

  assert.strictEqual(analysis.counter.doubleUnaryArray, 0);
});
