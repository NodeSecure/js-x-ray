// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { Pipeline } from "./Runner.class.ts";
import { InlinedNew } from "../InlinedNew.ts";
import { InlinedCallExpression } from "../InlinedCallExpression.ts";
import { walkEnter } from "../walker/index.ts";

export class Inline implements Pipeline {
  name = "inline";

  walk(body: ESTree.Program["body"]): ESTree.Program["body"] {
    const hoisted: ESTree.VariableDeclaration[] = [];

    walkEnter(body, function walk(node): void {
      if (Array.isArray(node)) {
        return;
      }

      const splitNew = InlinedNew.split(node);

      if (splitNew?.rebuildExpression) {
        hoisted.push(splitNew.virtualDeclaration);
        this.replaceAndSkip(splitNew.rebuildExpression);

        return;
      }

      const splitCallExpression = InlinedCallExpression.split(node);
      if (splitCallExpression?.rebuildExpression) {
        const blockStatement: ESTree.BlockStatement = {
          type: "BlockStatement",
          body: [
            splitCallExpression.virtualDeclaration,
            {
              type: "ExpressionStatement",
              expression: splitCallExpression.rebuildExpression as ESTree.Expression
            }
          ]
        };
        this.replaceAndSkip(blockStatement);
      }
    });

    return [...hoisted, ...body];
  }
}
