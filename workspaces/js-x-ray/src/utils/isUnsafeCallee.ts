// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

function isEvalCallee(
  node: ESTree.CallExpression
): boolean {
  const identifier = getCallExpressionIdentifier(node, {
    resolveCallExpression: false
  });

  return identifier === "eval";
}

function isFunctionCallee(
  node: ESTree.CallExpression
): boolean {
  const identifier = getCallExpressionIdentifier(node);

  return identifier === "Function" && node.callee.type === "CallExpression";
}

export function isUnsafeCallee(
  node: ESTree.CallExpression | ESTree.Node
): [boolean, "eval" | "Function" | null] {
  if (node.type !== "CallExpression") {
    return [false, null];
  }

  if (isEvalCallee(node)) {
    return [true, "eval"];
  }

  if (isFunctionCallee(node)) {
    return [true, "Function"];
  }

  return [false, null];
}
