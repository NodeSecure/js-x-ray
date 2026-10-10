// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { getMemberExpressionFullName } from "./getMemberExpressionIdentifier.ts";
import {
  type DefaultOptions,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  noop
} from "../types.ts";

export interface GetCallExpressionIdentifierOptions extends DefaultOptions {
  /**
   * Resolve the CallExpression callee if it is a MemberExpression.
   *
   * @default true
   * @example
   * require('./file.js')();
   *        ^ Second     ^ First
   */
  resolveCallExpression?: boolean;
}

export function getCallExpressionIdentifier(
  node: ESTree.Node,
  options: GetCallExpressionIdentifierOptions = {}
): string | null {
  if (node.type !== "CallExpression" && node.type !== "NewExpression") {
    return null;
  }
  const {
    externalIdentifierLookup = noop,
    resolveCallExpression = true
  } = options;

  if (isIdentifier(node.callee)) {
    return node.callee.name;
  }
  if (isMemberExpression(node.callee)) {
    const memberObject = node.callee.object;
    const lastId = getMemberExpressionFullName(node.callee, { externalIdentifierLookup });

    return resolveCallExpression && isCallExpression(memberObject) ?
      getCallExpressionIdentifier(memberObject) + `.${lastId}` :
      lastId;
  }

  return resolveCallExpression ?
    getCallExpressionIdentifier(node.callee, { externalIdentifierLookup }) : null;
}
