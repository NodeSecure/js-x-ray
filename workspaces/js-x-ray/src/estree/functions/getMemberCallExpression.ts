// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isCallExpression } from "../types.ts";

export type MemberCallExpression = ESTree.CallExpression & { callee: ESTree.MemberExpression; };

export function getMemberCallExpression(
  node: ESTree.Node | null | undefined,
  methodName: string
): MemberCallExpression | null {
  if (
    isCallExpression(node) &&
    node.callee.type === "MemberExpression" &&
    !node.callee.computed &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === methodName
  ) {
    return node as MemberCallExpression;
  }

  return null;
}
