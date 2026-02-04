// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import { match } from "ts-pattern";

// Import Internal Dependencies
import { joinArrayExpression } from "../estree/index.ts";
import { walkEnter } from "../walker/index.ts";
import type { Pipeline } from "./Runner.class.ts";

export class Deobfuscate implements Pipeline {
  name = "deobfuscate";

  #withCallExpression(
    node: ESTree.CallExpression
  ): ESTree.Node | void {
    const value = joinArrayExpression(node);
    if (value !== null) {
      return {
        type: "Literal",
        value,
        raw: value
      };
    }

    return void 0;
  }

  walk(
    body: ESTree.Program["body"]
  ): ESTree.Program["body"] {
    const self = this;
    walkEnter(body, function walk(node): void {
      if (Array.isArray(node)) {
        return;
      }

      match(node)
        .with({ type: "CallExpression" }, (node) => {
          this.replaceAndSkip(self.#withCallExpression(node));
        })
        .otherwise(() => void 0);
    });

    return body;
  }
}
