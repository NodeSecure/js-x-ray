// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "./getMemberExpressionIdentifier.js";

/**
 * @param {any} node
 * @returns {string | null}
 */
export function getCallExpressionIdentifier(node) {
  if (node.type !== "CallExpression") {
    return null;
  }

  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  if (node.callee.type === "MemberExpression") {
    return [...getMemberExpressionIdentifier(node.callee)].join(".");
  }

  return getCallExpressionIdentifier(node.callee);
}
