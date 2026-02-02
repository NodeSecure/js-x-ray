// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { extractLogicalExpression } from "../../src/estree/index.ts";
import { parseScript, getExpressionFromStatement } from "../helpers.ts";

test("it should extract two Nodes from a LogicalExpression with two operands", () => {
  const [astNode] = parseScript("5 || 10").body;
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
  const [astNode] = parseScript("5 || 10 || 15 || 20").body;
  const iter = extractLogicalExpression(
    getExpressionFromStatement(astNode)
  );

  const total = [...iter]
    .reduce((previous, { node }) => previous + (isLiteralNumber(node) ? node.value : 0), 0);
  assert.strictEqual(total, 50);
});

test("it should extract all Nodes but with different operators and a LogicalExpr on the right", () => {
  const [astNode] = parseScript("5 || 10 && 55").body;
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
