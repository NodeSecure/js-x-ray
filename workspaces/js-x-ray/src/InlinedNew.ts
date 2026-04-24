// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { Inlined, type SplitResult } from "./Inlined.ts";

export class InlinedNew {
  static split(node: ESTree.Node): SplitResult | null {
    if (node.type !== "CallExpression" && node.type !== "MemberExpression") {
      return null;
    }
    const newExpression = InlinedNew.#findNewCall(node);
    if (!newExpression) {
      return null;
    }

    return Inlined.buildSplitResult(node, newExpression, "new");
  }

  static #findNewCall(
    node: ESTree.Node
  ): ESTree.NewExpression | null {
    if (node.type === "CallExpression") {
      const callee = node.callee;

      return InlinedNew.#findNewCall(callee);
    }

    if (node.type === "MemberExpression") {
      return InlinedNew.#findNewCall(node.object);
    }

    if (node.type === "NewExpression") {
      return node;
    }

    return null;
  }
}
