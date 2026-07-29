// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { Inlined, type SplitResult } from "./Inlined.ts";
import {
  isCallExpression,
  isMemberExpression,
  isIdentifier
} from "./estree/index.ts";

export class InlinedCallExpression {
  static split(node: ESTree.Node): SplitResult | null {
    if (!isCallExpression(node) && !isMemberExpression(node)) {
      return null;
    }
    const callExpression = InlinedCallExpression.#findCallExpression({
      node
    });
    if (!callExpression || callExpression === node) {
      return null;
    }

    return Inlined.buildSplitResult(node, callExpression, "call_expression");
  }

  static #findCallExpression(
    { node, result = null, extraCallCount = 0 }: {
      node: ESTree.CallExpression | ESTree.MemberExpression;
      result?: ESTree.Expression | null;
      extraCallCount?: number;

    }
  ): ESTree.Expression | null {
    const object = isMemberExpression(node)
      ? node.object
      : node.callee;

    if (
      isCallExpression(object) &&
      isIdentifier(object.callee) && (
        object.callee.name === "require"
        || object.callee.name === "eval")) {
      return null;
    }

    if (isMemberExpression(node)) {
      return InlinedCallExpression.#findCallExpression({
        node: object,
        result: node,
        extraCallCount
      });
    }

    if (isCallExpression(node)) {
      return InlinedCallExpression.#findCallExpression({
        node: object,
        result: node,
        extraCallCount: extraCallCount + 1
      });
    }

    if (isCallExpression(result)) {
      return extraCallCount > 1 ? result : null;
    }

    return null;
  }
}
