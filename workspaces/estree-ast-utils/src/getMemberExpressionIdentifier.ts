// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { concatBinaryExpression } from "./concatBinaryExpression.ts";
import {
  type DefaultOptions,
  noop
} from "./options.ts";

/**
 * Return the complete identifier of a MemberExpression
 */
export function* getMemberExpressionIdentifier(
  node: ESTree.MemberExpression,
  options: DefaultOptions = {}
): IterableIterator<string> {
  const { externalIdentifierLookup = noop } = options;

  switch (node.object.type) {
    // Chain with another MemberExpression
    case "MemberExpression":
      yield* getMemberExpressionIdentifier(node.object, options);
      break;
    case "Identifier":
      yield node.object.name;
      break;
    // Literal is used when the property is computed
    case "Literal":
      if (typeof node.object.value === "string") {
        yield node.object.value;
      }
      break;
  }

  switch (node.property.type) {
    case "Identifier": {
      const identifierValue = externalIdentifierLookup(node.property.name);
      if (identifierValue === null) {
        yield node.property.name;
      }
      else {
        yield identifierValue;
      }

      break;
    }
    // Literal is used when the property is computed
    case "Literal":
      if (typeof node.property.value === "string") {
        yield node.property.value;
      }
      break;

    // foo.bar[callexpr()]
    case "CallExpression": {
      const args = node.property.arguments;
      if (
        args.length > 0 &&
        args[0].type === "Literal" &&
        typeof args[0].value === "string" &&
        Hex.isHex(args[0].value)
      ) {
        yield Buffer.from(args[0].value, "hex").toString();
      }
      break;
    }

    // foo.bar["k" + "e" + "y"]
    case "BinaryExpression": {
      const literal = [...concatBinaryExpression(node.property, options)].join("");
      if (literal.trim() !== "") {
        yield literal;
      }
      break;
    }
  }
}
