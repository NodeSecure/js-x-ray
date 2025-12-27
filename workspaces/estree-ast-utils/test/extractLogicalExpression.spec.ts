// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { extractLogicalExpression } from "../src/index.ts";
import { codeToAst, getExpressionFromStatement } from "./utils.ts";

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
    .reduce((previous, { node }) => previous + (isLiteralNumber(node) ? node.value : 0), 0);
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

function isLiteralNumber(
  node: ESTree.Node
): node is ESTree.Literal & { value: number; } {
  return node.type === "Literal" && typeof node.value === "number";
}
