// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isCallExpression, isIdentifier, isMemberExpression } from "../types.ts";

export type MemberCallExpression = ESTree.CallExpression & { callee: ESTree.MemberExpression; };

export function getMemberCallExpression(
  node: ESTree.Node | null | undefined,
  methodName: string
): MemberCallExpression | null {
  if (
    isCallExpression(node) &&
    isMemberExpression(node.callee) &&
    !node.callee.computed &&
    isIdentifier(node.callee.property) &&
    node.callee.property.name === methodName
  ) {
    return node as MemberCallExpression;
  }

  return null;
}
