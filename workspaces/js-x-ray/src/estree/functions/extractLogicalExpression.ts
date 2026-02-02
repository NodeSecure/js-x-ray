// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export function* extractLogicalExpression(
  node: ESTree.Node
): IterableIterator<{ operator: string; node: ESTree.Expression; }> {
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
