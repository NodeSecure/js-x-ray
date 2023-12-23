// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "./getMemberExpressionIdentifier.js";
import { VariableTracer } from "./utils/VariableTracer.js";

/**
 * @param {any} node
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @param {boolean} [options.resolveCallExpression=true]
 * @returns {string | null}
 */
export function getCallExpressionIdentifier(node, options = {}) {
  if (node.type !== "CallExpression") {
    return null;
  }
  const { tracer = null, resolveCallExpression = true } = options;

  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  if (node.callee.type === "MemberExpression") {
    return [
      ...getMemberExpressionIdentifier(node.callee, { tracer })
    ].join(".");
  }

  return resolveCallExpression ?
    getCallExpressionIdentifier(node.callee, { tracer }) : null;
}
