// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import { walk as doWalk } from "estree-walker";
import {
  arrayExpressionToString,
  getMemberExpressionIdentifier,
  getCallExpressionArguments
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";
import { VariableTracer } from "@nodesecure/tracer";

export class RequireCallExpressionWalker {
  tracer: VariableTracer;
  dependencies: Set<string>;
  triggerWarning: boolean;

  constructor(
    tracer: VariableTracer
  ) {
    this.tracer = tracer;
    this.dependencies = new Set();
    this.triggerWarning = true;
  }

  walk(
    nodeToWalk: ESTree.Node
  ) {
    this.dependencies = new Set();
    this.triggerWarning = true;

    // we need the `this` context of doWalk.enter
    const self = this;
    doWalk(nodeToWalk as any, {
      enter(node: any) {
        if (
          node.type !== "CallExpression" ||
          node.arguments.length === 0
        ) {
          return;
        }

        const rootArgument = node.arguments.at(0)!;
        if (
          rootArgument.type === "Literal" &&
          typeof rootArgument.value === "string" &&
          Hex.isHex(rootArgument.value)
        ) {
          self.dependencies.add(Buffer.from(rootArgument.value, "hex").toString());
          this.skip();

          return;
        }

        const fullName = node.callee.type === "MemberExpression" ?
          [...getMemberExpressionIdentifier(node.callee)].join(".") :
          node.callee.name;
        const tracedFullName = self.tracer.getDataFromIdentifier(fullName)?.identifierOrMemberExpr ?? fullName;
        switch (tracedFullName) {
          case "atob":
            self.#handleAtob(node);
            break;
          case "Buffer.from":
            self.#handleBufferFrom(node);
            break;
          case "require.resolve":
            self.#handleRequireResolve(rootArgument);
            break;
          case "path.join":
            self.#handlePathJoin(node);
            break;
        }
      }
    });

    return {
      dependencies: this.dependencies,
      triggerWarning: this.triggerWarning
    };
  }

  #handleAtob(
    node: ESTree.CallExpression
  ): void {
    const nodeArguments = getCallExpressionArguments(node, { tracer: this.tracer });
    if (nodeArguments !== null && nodeArguments.length > 0) {
      this.dependencies.add(
        Buffer.from(nodeArguments.at(0)!, "base64").toString()
      );
    }
  }

  #handleBufferFrom(
    node: ESTree.CallExpression
  ) {
    const [element] = node.arguments;
    if (element.type === "ArrayExpression") {
      const depName = [...arrayExpressionToString(element)].join("").trim();
      this.dependencies.add(depName);
    }
  }

  #handleRequireResolve(
    rootArgument: ESTree.Node
  ) {
    if (
      rootArgument.type === "Literal" &&
      typeof rootArgument.value === "string"
    ) {
      this.dependencies.add(rootArgument.value);
    }
  }

  #handlePathJoin(
    node
  ) {
    if (!node.arguments.every((arg) => arg.type === "Literal" && typeof arg.value === "string")) {
      return;
    }
    const constructedPath = path.posix.join(...node.arguments.map((arg) => arg.value));
    this.dependencies.add(constructedPath);
    this.triggerWarning = false;
  }
}
