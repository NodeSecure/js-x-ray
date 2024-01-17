/// Import Third-party Dependencies
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

export function exportAssignmentHasRequireLeave(expr) {
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

function atLeastOneBranchHasRequireLeave(left, right) {
  return [
    exportAssignmentHasRequireLeave(left),
    exportAssignmentHasRequireLeave(right)
  ].some((hasRequire) => hasRequire);
}
