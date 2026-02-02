// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  getCallExpressionIdentifier
} from "../../estree/index.ts";
import { VirtualVariableIdentifier } from "../../VirtualVariableIdentifier.ts";

export interface SplitResult {
  /**
   * A virtual variable name that replaces the require() call
   */
  virtualIdentifier: string;
  /**
   * Virtual variable declaration: const __virtual_require_0__ = require("xxx")
   * Can be walked with standard ESTree walkers.
   */
  virtualDeclaration: ESTree.VariableDeclaration;
  /**
   * The rebuilt expression with require() replaced by the virtual identifier.
   * For `require("x").spawn("y")`, this would be `__virtual_require_0__.spawn("y")`
   * Can be walked with standard ESTree walkers.
   */
  rebuildExpression: ESTree.Node | null;
}

export class InlinedRequire {
  static assertNode(
    node: ESTree.Node
  ): node is ESTree.CallExpression {
    if (
      node.type === "CallExpression" &&
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

    const virtualIdentifier = VirtualVariableIdentifier.generate(
      "require",
      expectedCallExpr.loc
    );

    return {
      virtualIdentifier,
      virtualDeclaration: {
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: virtualIdentifier
            },
            init: requireCall
          }
        ]
      },
      rebuildExpression: InlinedRequire.#rebuildWithVirtualIdentifier(
        expectedCallExpr,
        requireCall,
        virtualIdentifier
      )
    };
  }

  static #findRequireCall(
    node: ESTree.CallExpression | ESTree.MemberExpression
  ): ESTree.CallExpression | null {
    const object = node.type === "MemberExpression"
      ? node.object
      : node.callee;

    if (
      object.type === "CallExpression" &&
      object.callee.type === "Identifier" &&
      object.callee.name === "require"
    ) {
      return object;
    }

    if (
      object.type === "MemberExpression" ||
      object.type === "CallExpression"
    ) {
      return InlinedRequire.#findRequireCall(object);
    }

    return null;
  }

  static #rebuildWithVirtualIdentifier(
    node: ESTree.CallExpression,
    requireCall: ESTree.CallExpression,
    virtualIdentifier: string
  ): ESTree.Node | null {
    if (node === requireCall) {
      return null;
    }

    const virtualId: ESTree.Identifier = {
      type: "Identifier",
      name: virtualIdentifier
    };

    return InlinedRequire.#cloneAndReplace(
      node,
      requireCall,
      virtualId
    );
  }

  static #cloneAndReplace(
    node: ESTree.Node,
    target: ESTree.CallExpression,
    replacement: ESTree.Identifier
  ): ESTree.Node {
    if (node === target) {
      return replacement;
    }

    if (node.type === "CallExpression") {
      const callee = InlinedRequire.#cloneAndReplace(
        node.callee,
        target,
        replacement
      ) as ESTree.Expression;

      const args = node.arguments.map(
        (arg) => InlinedRequire.#cloneAndReplace(arg, target, replacement)
      ) as ESTree.Expression[];

      return {
        ...node,
        callee,
        arguments: args
      };
    }

    if (node.type === "MemberExpression") {
      return {
        ...node,
        object: InlinedRequire.#cloneAndReplace(
          node.object,
          target,
          replacement
        ) as ESTree.Expression
      };
    }

    return node;
  }
}
