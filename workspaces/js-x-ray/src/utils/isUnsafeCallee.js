// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

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
