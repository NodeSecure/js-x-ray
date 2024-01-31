
export function* extractLogicalExpression(
  node
) {
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
