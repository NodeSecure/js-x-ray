// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "./getMemberExpressionIdentifier.js";
import type { TracerOptions, NodeAst } from "./types.js";

export interface GetCallExpressionIdentifierOptions extends TracerOptions {
  resolveCallExpression?: boolean;
}

export function getCallExpressionIdentifier(
  node: NodeAst,
  options: GetCallExpressionIdentifierOptions = {}
): string | null {
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
