// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isBinaryExpression from "../../src/probes/isBinaryExpression.js";

test("should detect 1 deep binary expression", () => {
  const str = "0x1*-0x12df+-0x1fb9*-0x1+0x2*-0x66d";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isBinaryExpression)
    .execute(ast.body);

  assert.equal(analysis.counter.deepBinaryExpr, 1);
});

test("should not detect deep binary expression", () => {
  const str = "10 + 5 - (10)";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isBinaryExpression)
    .execute(ast.body);

  assert.equal(analysis.counter.deepBinaryExpr, 0);
});
