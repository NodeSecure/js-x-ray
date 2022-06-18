// Import Node.js Dependencies
import { builtinModules } from "repl";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import { globalParts } from "../constants.js";

// CONSTANTS
const kNodeDeps = new Set(builtinModules);

/**
 * @description Search for Literal AST Node
 * @see https://github.com/estree/estree/blob/master/es5.md#literal
 * @example
 * "foobar"
 */
function validateNode(node) {
  return [
    node.type === "Literal" && typeof node.value === "string"
  ];
}

function main(node, options) {
  const { analysis } = options;

  // We are searching for value obfuscated as hex of a minimum length of 4.
  if (/^[0-9A-Fa-f]{4,}$/g.test(node.value)) {
    const value = Buffer.from(node.value, "hex").toString();
    analysis.analyzeString(value);

    // If the value we are retrieving is the name of a Node.js dependency,
    // then we add it to the dependencies list and we throw an unsafe-import at the current location.
    if (kNodeDeps.has(value)) {
      analysis.dependencies.add(value, node.loc);
      analysis.addWarning("unsafe-import", null, node.loc);
    }
    else if (globalParts.has(value) || !Hex.isSafe(node.value)) {
      analysis.addWarning("encoded-literal", node.value, node.loc);
    }
  }
  // Else we are checking all other string with our suspect method
  else {
    analysis.analyzeLiteral(node);
  }
}

export default {
  name: "isLiteral",
  validateNode, main, breakOnMatch: false
};
