// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { VirtualVariableIdentifier } from "./VirtualVariableIdentifier.ts";

export interface SplitResult {
  /**
   * A virtual variable name that replaces the target
   */
  virtualIdentifier: string;
  /**
   * Virtual variable declaration:
   * require: const __virtual_require_0__ = require("xxx")
   * new: const __virtual_new_0__ = new Foo("xxx")
   * Can be walked with standard ESTree walkers.
   */
  virtualDeclaration: ESTree.VariableDeclaration;
  /**
   * The rebuilt expression with require() replaced by the virtual identifier.
   * For `require("x").spawn("y")`, this would be `__virtual_require_0__.spawn("y")`
   * For `(new Foo()).bar()`, this would be `__virtual_new_0__.bar()`
   * Can be walked with standard ESTree walkers.
   */
  rebuildExpression: ESTree.Node | null;
}

export class Inlined {
  static buildSplitResult(
    node: ESTree.Node,
    target: ESTree.Expression,
    identifier: string
  ): SplitResult {
    const virtualIdentifier = VirtualVariableIdentifier.generate(
      identifier,
      node.loc
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
            init: target
          }
        ]

      },
      rebuildExpression: Inlined.#rebuildWithVirtualIdentifier(
        node,
        target,
        virtualIdentifier
      )
    };
  }

  static #rebuildWithVirtualIdentifier(
    node: ESTree.Node,
    target: ESTree.Node,
    virtualIdentifier: string
  ): ESTree.Node | null {
    if (node === target) {
      return null;
    }

    const virtualId: ESTree.Identifier = {
      type: "Identifier",
      name: virtualIdentifier
    };

    return Inlined.#cloneAndReplace(
      node,
      target,
      virtualId
    );
  }

  static #cloneAndReplace(
    node: ESTree.Node,
    target: ESTree.Node,
    replacement: ESTree.Identifier
  ): ESTree.Node {
    if (node === target) {
      return replacement;
    }

    if (node.type === "CallExpression") {
      const callee = Inlined.#cloneAndReplace(
        node.callee,
        target,
        replacement
      ) as ESTree.Expression;

      const args = node.arguments.map(
        (arg) => Inlined.#cloneAndReplace(arg, target, replacement)
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
        object: Inlined.#cloneAndReplace(
          node.object,
          target,
          replacement
        ) as ESTree.Expression
      };
    }

    return node;
  }
}
