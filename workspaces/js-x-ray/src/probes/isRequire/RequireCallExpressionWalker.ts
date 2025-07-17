// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import {
  arrayExpressionToString,
  getMemberExpressionIdentifier,
  getCallExpressionArguments
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";
import { VariableTracer } from "@nodesecure/tracer";

// Import Internal Dependencies
import {
  isLiteral,
  isCallExpression
} from "../../types/estree.js";
import { walkEnter } from "../../walker/index.js";

export class RequireCallExpressionWalker {
  tracer: VariableTracer;
  dependencies = new Set<string>();
  triggerWarning = true;

  constructor(
    tracer: VariableTracer
  ) {
    this.tracer = tracer;
  }

  reset() {
    this.dependencies.clear();
    this.triggerWarning = true;
  }

  walk(
    callExprNode: ESTree.CallExpression
  ) {
    this.reset();

    // we need the `this` context of doWalk.enter
    const self = this;
    walkEnter(callExprNode, function enter(node) {
      if (
        !isCallExpression(node) ||
        node.arguments.length === 0
      ) {
        return;
      }

      const castedNode = node as ESTree.CallExpression;
      const rootArgument = castedNode.arguments.at(0)!;
      if (
        rootArgument.type === "Literal" &&
        typeof rootArgument.value === "string" &&
        Hex.isHex(rootArgument.value)
      ) {
        self.dependencies.add(Buffer.from(rootArgument.value, "hex").toString());
        this.skip();

        return;
      }

      const fullName = castedNode.callee.type === "MemberExpression" ?
        [...getMemberExpressionIdentifier(castedNode.callee)].join(".") :
        castedNode.callee.name;
      const tracedFullName = self.tracer.getDataFromIdentifier(fullName)?.identifierOrMemberExpr ?? fullName;
      switch (tracedFullName) {
        case "atob":
          self.#handleAtob(castedNode);
          break;
        case "Buffer.from":
          self.#handleBufferFrom(castedNode);
          break;
        case "require.resolve":
          self.#handleRequireResolve(rootArgument);
          break;
        case "path.join":
          self.#handlePathJoin(castedNode);
          break;
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
    const nodeArguments = getCallExpressionArguments(
      node,
      {
        externalIdentifierLookup: (name) => this.tracer.literalIdentifiers.get(name) ?? null
      }
    );

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
    node: ESTree.Node
  ) {
    if (isLiteral(node)) {
      this.dependencies.add(node.value);
    }
  }

  #handlePathJoin(
    node: ESTree.CallExpression
  ) {
    if (!node.arguments.every((arg) => isLiteral(arg))) {
      return;
    }

    const constructedPath = path.posix.join(
      ...node.arguments.map((arg) => arg.value)
    );
    this.dependencies.add(constructedPath);
    this.triggerWarning = false;
  }
}
