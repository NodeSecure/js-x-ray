// Import Node.js dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isAssignmentExpression from "../../src/probes/isAssignmentExpression.js";

test("should detect 1 assignment expression", () => {
  const str = "obj = { foo: 1 }";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isAssignmentExpression)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.assignExpr, 1);
});

test("should detect 0 assignment expression", () => {
  const str = "Object.assign(obj, { foo: 1 })";
  const ast = parseScript(str);
  const { sourceFile } = getSastAnalysis(str, isAssignmentExpression)
    .execute(ast.body);

  assert.equal(sourceFile.idtypes.assignExpr, 0);
});
