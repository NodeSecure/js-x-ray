// Import Third-party dependencies
import test from "tape";

// Import Internal Dependencies
import { getSastAnalysis, parseScript } from "../utils/index.js";
import isBinaryExpression from "../../src/probes/isBinaryExpression.js";

test("should detect 1 deep binary expression", (tape) => {
  const str = "0x1*-0x12df+-0x1fb9*-0x1+0x2*-0x66d";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isBinaryExpression)
    .execute(ast.body);

  tape.equal(analysis.counter.deepBinaryExpr, 1);

  tape.end();
});

test("should not detect deep binary expression", (tape) => {
  const str = "10 + 5 - (10)";
  const ast = parseScript(str);
  const { analysis } = getSastAnalysis(str, isBinaryExpression)
    .execute(ast.body);

  tape.equal(analysis.counter.deepBinaryExpr, 0);

  tape.end();
});
