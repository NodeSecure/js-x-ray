// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isMemberExpression from "../../src/probes/isMemberExpression.js";

test("should detect 1 member expression", () => {
  const str = "process.mainModule";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isMemberExpression)
    .execute(ast.body);

  assert.equal(analysis.counter.memberExpr, 1);
});

test("should detect 2 members expressions", () => {
  const str = "process.mainModule.foo";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isMemberExpression)
    .execute(ast.body);

  assert.equal(analysis.counter.memberExpr, 2);
});

test("should detect 1 member expression and 2 nodes", () => {
  const str = "process.mainModule['foo']['bar']";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isMemberExpression)
    .execute(ast.body);

  assert.equal(analysis.counter.memberExpr, 1);
  assert.equal(analysis.counter.computedMemberExpr, 2);
});

test("should detect 0 member expression", () => {
  const str = "process";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isMemberExpression)
    .execute(ast.body);

  assert.equal(analysis.counter.memberExpr, 0);
});
