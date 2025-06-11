// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "./getMemberExpressionIdentifier.js";

/**
 * @typedef {import('./utils/VariableTracer.js').VariableTracer} VariableTracer
 */

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
    const memberObject = node.callee.object;
    const lastId = [
      ...getMemberExpressionIdentifier(node.callee, { tracer })
    ].join(".");

    return resolveCallExpression && memberObject.type === "CallExpression" ?
      getCallExpressionIdentifier(memberObject) + `.${lastId}` :
      lastId;
  }

  return resolveCallExpression ?
    getCallExpressionIdentifier(node.callee, { tracer }) : null;
}
