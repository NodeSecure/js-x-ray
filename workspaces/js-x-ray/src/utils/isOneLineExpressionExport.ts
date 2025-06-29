// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

export function isOneLineExpressionExport(
  body: ESTree.Program["body"]
): boolean {
  if (body.length === 0 || body.length > 1) {
    return false;
  }

  const [firstNode] = body;
  if (firstNode.type !== "ExpressionStatement") {
    return false;
  }

  switch (firstNode.expression.type) {
    // module.exports = require('...');
    case "AssignmentExpression":
      return exportAssignmentHasRequireLeave(firstNode.expression.right);
    // require('...');
    case "CallExpression":
      return exportAssignmentHasRequireLeave(firstNode.expression);
    default:
      return false;
  }
}

function exportAssignmentHasRequireLeave(
  expr: ESTree.Expression
): boolean {
  if (expr.type === "LogicalExpression") {
    return atLeastOneBranchHasRequireLeave(expr.left, expr.right);
  }

  if (expr.type === "ConditionalExpression") {
    return atLeastOneBranchHasRequireLeave(expr.consequent, expr.alternate);
  }

  if (expr.type === "CallExpression") {
    return getCallExpressionIdentifier(expr) === "require";
  }

  if (expr.type === "MemberExpression") {
    let rootMember = expr.object;
    while (rootMember.type === "MemberExpression") {
      rootMember = rootMember.object;
    }

    if (rootMember.type !== "CallExpression") {
      return false;
    }

    return getCallExpressionIdentifier(rootMember) === "require";
  }

  return false;
}

function atLeastOneBranchHasRequireLeave(
  left: ESTree.Expression,
  right: ESTree.Expression
): boolean {
  return [
    exportAssignmentHasRequireLeave(left),
    exportAssignmentHasRequireLeave(right)
  ].some((hasRequire) => hasRequire);
}
