// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { Pipeline } from "./Runner.class.ts";
import { InlinedNew } from "../InlinedNew.ts";
import { walkEnter } from "../walker/index.ts";

export class Inline implements Pipeline {
  name = "inline";

  walk(body: ESTree.Program["body"]): ESTree.Program["body"] {
    const hoisted: ESTree.VariableDeclaration[] = [];

    walkEnter(body, function walk(node): void {
      if (Array.isArray(node)) {
        return;
      }

      const split = InlinedNew.split(node);

      if (split?.rebuildExpression) {
        hoisted.push(split.virtualDeclaration);
        this.replaceAndSkip(split.rebuildExpression);
      }
    });

    return [...hoisted, ...body];
  }
}
