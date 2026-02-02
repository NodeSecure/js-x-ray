// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "./getMemberExpressionIdentifier.ts";
import {
  type DefaultOptions,
  noop
} from "../types.ts";

export interface GetCallExpressionIdentifierOptions extends DefaultOptions {
  /**
   * Resolve the CallExpression callee if it is a MemberExpression.
   *
   * @default true
   * @example
   * require('./file.js')();
            ^ Second     ^ First
   */
  resolveCallExpression?: boolean;
}

export function getCallExpressionIdentifier(
  node: ESTree.Node,
  options: GetCallExpressionIdentifierOptions = {}
): string | null {
  if (node.type !== "CallExpression") {
    return null;
  }
  const {
    externalIdentifierLookup = noop,
    resolveCallExpression = true
  } = options;

  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  if (node.callee.type === "MemberExpression") {
    const memberObject = node.callee.object;
    const lastId = [
      ...getMemberExpressionIdentifier(node.callee, { externalIdentifierLookup })
    ].join(".");

    return resolveCallExpression && memberObject.type === "CallExpression" ?
      getCallExpressionIdentifier(memberObject) + `.${lastId}` :
      lastId;
  }

  return resolveCallExpression ?
    getCallExpressionIdentifier(node.callee, { externalIdentifierLookup }) : null;
}
