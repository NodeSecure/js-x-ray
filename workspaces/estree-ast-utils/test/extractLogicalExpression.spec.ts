// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { extractLogicalExpression } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("it should extract two Nodes from a LogicalExpression with two operands", () => {
  const [astNode] = codeToAst("5 || 10");
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const iterResult = [...iter];
  assert.strictEqual(iterResult.length, 2);

  assert.strictEqual(iterResult[0].operator, "||");
  assert.strictEqual(iterResult[0].node.type, "Literal");
  assert.strictEqual(iterResult[0].node.value, 5);

  assert.strictEqual(iterResult[1].operator, "||");
  assert.strictEqual(iterResult[1].node.type, "Literal");
  assert.strictEqual(iterResult[1].node.value, 10);
});

test("it should extract all nodes and add up all Literal values", () => {
  const [astNode] = codeToAst("5 || 10 || 15 || 20");
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const total = [...iter]
    .reduce((previous, { node }) => previous + node.value, 0);
  assert.strictEqual(total, 50);
});

test("it should extract all Nodes but with different operators and a LogicalExpr on the right", () => {
  const [astNode] = codeToAst("5 || 10 && 55");
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const operators = new Set(
    [...iter].map(({ operator }) => operator)
  );
  assert.deepEqual([...operators], ["||", "&&"]);
});
