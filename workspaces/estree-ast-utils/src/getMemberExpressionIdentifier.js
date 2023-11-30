// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import { concatBinaryExpression } from "./concatBinaryExpression.js";
import { VariableTracer } from "./utils/VariableTracer.js";

/**
 * Return the complete identifier of a MemberExpression
 *
 * @param {any} node
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @returns {IterableIterator<string>}
 */
export function* getMemberExpressionIdentifier(node, options = {}) {
  const { tracer = null } = options;

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
      yield node.object.value;
      break;
  }

  switch (node.property.type) {
    case "Identifier": {
      if (tracer !== null && tracer.literalIdentifiers.has(node.property.name)) {
        yield tracer.literalIdentifiers.get(node.property.name);
      }
      else {
        yield node.property.name;
      }

      break;
    }
    // Literal is used when the property is computed
    case "Literal":
      yield node.property.value;
      break;

    // foo.bar[callexpr()]
    case "CallExpression": {
      const args = node.property.arguments;
      if (args.length > 0 && args[0].type === "Literal" && Hex.isHex(args[0].value)) {
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
