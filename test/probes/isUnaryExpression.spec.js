// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isUnaryExpression from "../../src/probes/isUnaryExpression.js";

test("should detect one UnaryArray", (tape) => {
  const str = "!![]";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isUnaryExpression)
    .execute(ast.body);

  tape.strictEqual(analysis.counter.doubleUnaryArray, 1);

  tape.end();
});

test("should not detect any UnaryArray", (tape) => {
  const str = "![]";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isUnaryExpression)
    .execute(ast.body);

  tape.strictEqual(analysis.counter.doubleUnaryArray, 0);

  tape.end();
});
