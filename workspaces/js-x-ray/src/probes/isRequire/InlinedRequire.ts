// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  getCallExpressionIdentifier,
  isCallExpression,
  isIdentifier,
  isMemberExpression
} from "../../estree/index.ts";
import { Inlined, type SplitResult } from "../../Inlined.ts";

export class InlinedRequire {
  static assertNode(
    node: ESTree.Node
  ): node is ESTree.CallExpression {
    if (
      isCallExpression(node) &&
      getCallExpressionIdentifier(node)?.match(/^require..*$/i)
    ) {
      return true;
    }

    return false;
  }

  static split(
    expectedCallExpr: ESTree.Node
  ): SplitResult | null {
    if (!InlinedRequire.assertNode(expectedCallExpr)) {
      return null;
    }

    const requireCall = InlinedRequire.#findRequireCall(expectedCallExpr);
    if (!requireCall) {
      return null;
    }

    return Inlined.buildSplitResult(
      expectedCallExpr,
      requireCall,
      "require"
    );
  }

  static #findRequireCall(
    node: ESTree.CallExpression | ESTree.MemberExpression
  ): ESTree.CallExpression | null {
    const object = isMemberExpression(node)
      ? node.object
      : node.callee;

    if (
      isCallExpression(object) &&
      isIdentifier(object.callee) &&
      object.callee.name === "require"
    ) {
      return object;
    }

    if (
      isMemberExpression(object) ||
      isCallExpression(object)
    ) {
      return InlinedRequire.#findRequireCall(object);
    }

    return null;
  }
}
