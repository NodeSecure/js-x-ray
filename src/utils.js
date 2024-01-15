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

export function isLogicalExpressionExport(body) {
  if (body.length > 1) {
    return false;
  }

  if (body[0].type !== "ExpressionStatement") {
    return false;
  }

  if (body[0].expression.type !== "AssignmentExpression") {
    return false;
  }

  return body[0].expression.right.type === "LogicalExpression";
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
