// Require Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isAssignmentExpression from "../../src/probes/isAssignmentExpression.js";

// Require Third-party dependencies
import test from "tape";

test("should detect 1 assignment expression", (tape) => {
  const str = "obj = { foo: 1 }";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isAssignmentExpression);

  tape.equal(analysis.idtypes.assignExpr, 1);

  tape.end();
});

test("should detect 0 assignment expression", (tape) => {
  const str = "Object.assign(obj, { foo: 1 })";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isAssignmentExpression);

  tape.equal(analysis.idtypes.assignExpr, 0);

  tape.end();
});
