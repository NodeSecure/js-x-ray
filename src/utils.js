// Import Third-party Dependencies
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

export function notNullOrUndefined(value) {
  return value !== null && value !== void 0;
}

function isEvalCallee(node) {
  const identifier = getCallExpressionIdentifier(node, {
    resolveCallExpression: false
  });

  return identifier === "eval";
}

function isFunctionCallee(node) {
  const identifier = getCallExpressionIdentifier(node);

  return identifier === "Function" && node.callee.type === "CallExpression";
}

export function isUnsafeCallee(node) {
  if (isEvalCallee(node)) {
    return [true, "eval"];
  }

  if (isFunctionCallee(node)) {
    return [true, "Function"];
  }

  return [false, null];
}

export function isOneLineExpressionExport(body) {
  if (body.length > 1) {
    return false;
  }

  if (body[0].type !== "ExpressionStatement") {
    return false;
  }

  if (body[0].expression.type !== "AssignmentExpression") {
    return false;
  }

  return exportAssignmentHasRequireLeave(body[0].expression.right);
}

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

export function rootLocation() {
  return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
}

export function toArrayLocation(location = rootLocation()) {
  const { start, end = start } = location;

  return [
    [start.line || 0, start.column || 0],
    [end.line || 0, end.column || 0]
  ];
}

export function extractNode(expectedType) {
  return (callback, nodes) => {
    const finalNodes = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of finalNodes) {
      if (notNullOrUndefined(node) && node.type === expectedType) {
        callback(node);
      }
    }
  };
}
