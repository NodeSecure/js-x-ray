// Import Internal Dependencies
import type { NodeAst } from "./types.js";

export type LogicalExpressionOperators = "||" | "&&" | "??";

export function* extractLogicalExpression(
  node: NodeAst
): IterableIterator<{ operator: LogicalExpressionOperators; node: NodeAst; }> {
  if (node.type !== "LogicalExpression") {
    return;
  }

  if (node.left.type === "LogicalExpression") {
    yield* extractLogicalExpression(node.left);
  }
  else {
    yield { operator: node.operator, node: node.left };
  }

  if (node.right.type === "LogicalExpression") {
    yield* extractLogicalExpression(node.right);
  }
  else {
    yield { operator: node.operator, node: node.right };
  }
}
