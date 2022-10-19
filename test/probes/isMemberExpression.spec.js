// Require Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isMemberExpression from "../../src/probes/isMemberExpression.js";

// Require Third-party dependencies
import test from "tape";

test("should detect 1 member expression", (tape) => {
  const str = "process.mainModule";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isMemberExpression);

  tape.equal(analysis.counter.memberExpr, 1);

  tape.end();
});

test("should detect 2 members expressions", (tape) => {
  const str = "process.mainModule.foo";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isMemberExpression);

  tape.equal(analysis.counter.memberExpr, 2);

  tape.end();
});

test("should detect 1 member expression and 2 nodes", (tape) => {
  const str = "process.mainModule['foo']['bar']";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isMemberExpression);

  tape.equal(analysis.counter.memberExpr, 1);
  tape.equal(analysis.counter.computedMemberExpr, 2);

  tape.end();
});

test("should detect 0 member expression", (tape) => {
  const str = "process";
  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body, isMemberExpression);

  tape.equal(analysis.counter.memberExpr, 0);

  tape.end();
});
