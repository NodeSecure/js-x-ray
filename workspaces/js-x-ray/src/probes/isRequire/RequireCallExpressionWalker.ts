// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { Hex, isStringBase64 } from "../../utils/index.ts";
import {
  arrayExpressionToString,
  getCallExpressionArguments,
  getMemberExpressionFullName
} from "../../estree/index.ts";
import type { VariableTracer } from "../../VariableTracer.ts";
import {
  isCallExpression,
  isStringLiteral,
  isMemberExpression,
  isIdentifier
} from "../../estree/types.ts";
import { walkEnter } from "../../walker/index.ts";

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
      const decodedRootArg = isStringLiteral(rootArgument) ?
        Hex.decode(rootArgument.value) :
        null;
      if (decodedRootArg !== null) {
        self.dependencies.add(decodedRootArg);
        this.skip();

        return;
      }

      const { callee } = castedNode;
      if (!isMemberExpression(callee) && !isIdentifier(callee)) {
        return;
      }

      const fullName = isMemberExpression(callee) ?
        getMemberExpressionFullName(callee) :
        callee.name;
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
        case "path.resolve":
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
        externalIdentifierLookup: this.tracer.resolveLiteralIdentifier
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
    const [element, encoding] = node.arguments;
    if (element.type === "ArrayExpression") {
      const depName = [...arrayExpressionToString(element)].join("").trim();
      this.dependencies.add(depName);

      return;
    }

    if (
      isStringLiteral(element) &&
      isStringLiteral(encoding) &&
      encoding.value === "base64" &&
      isStringBase64(element.value, { allowEmpty: false })
    ) {
      this.dependencies.add(
        Buffer.from(element.value, "base64").toString()
      );
    }
  }

  #handleRequireResolve(
    node: ESTree.Node
  ) {
    if (isStringLiteral(node)) {
      this.dependencies.add(node.value);
    }
  }

  #handlePathJoin(
    node: ESTree.CallExpression
  ) {
    if (!node.arguments.every((arg) => isStringLiteral(arg))) {
      return;
    }

    const constructedPath = path.posix.join(
      ...node.arguments.map((arg) => arg.value)
    );
    this.dependencies.add(constructedPath);
    this.triggerWarning = false;
  }
}
