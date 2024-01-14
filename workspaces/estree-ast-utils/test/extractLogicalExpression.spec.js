// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { extractLogicalExpression } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("it should extract two Nodes from a LogicalExpression with two operands", (tape) => {
  const [astNode] = codeToAst("5 || 10");
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const iterResult = [...iter];
  tape.strictEqual(iterResult.length, 2);

  tape.strictEqual(iterResult[0].operator, "||");
  tape.strictEqual(iterResult[0].node.type, "Literal");
  tape.strictEqual(iterResult[0].node.value, 5);

  tape.strictEqual(iterResult[1].operator, "||");
  tape.strictEqual(iterResult[1].node.type, "Literal");
  tape.strictEqual(iterResult[1].node.value, 10);

  tape.end();
});

test("it should extract all nodes and add up all Literal values", (tape) => {
  const [astNode] = codeToAst("5 || 10 || 15 || 20");
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const total = [...iter]
    .reduce((previous, { node }) => previous + node.value, 0);
  tape.strictEqual(total, 50);

  tape.end();
});

test("it should extract all Nodes but with different operators and a LogicalExpr on the right", (tape) => {
  const [astNode] = codeToAst("5 || 10 && 55");
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const operators = new Set(
    [...iter].map(({ operator }) => operator)
  );
  tape.deepEqual([...operators], ["||", "&&"]);

  tape.end();
});
