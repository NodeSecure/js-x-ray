// Import Node.js Dependencies
import { builtinModules } from "repl";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

// CONSTANTS
const kNodeDeps = new Set(builtinModules);
const kShadyLinkRegExps = [
  /(http[s]?:\/\/bit\.ly.*)$/,
  /(http[s]?:\/\/.*\.(link|xyz|tk|ml|ga|cf|gq|pw|top|club|mw|bd|ke|am|sbs|date|quest|cd|bid|cd|ws|icu|cam|uno|email|stream))$/
];

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
  const { sourceFile } = options;

  // We are searching for value obfuscated as hex of a minimum length of 4.
  if (/^[0-9A-Fa-f]{4,}$/g.test(node.value)) {
    const value = Buffer.from(node.value, "hex").toString();
    sourceFile.deobfuscator.analyzeString(value);

    // If the value we are retrieving is the name of a Node.js dependency,
    // then we add it to the dependencies list and we throw an unsafe-import at the current location.
    if (kNodeDeps.has(value)) {
      sourceFile.addDependency(value, node.loc);
      sourceFile.addWarning("unsafe-import", null, node.loc);
    }
    else if (value === "require" || !Hex.isSafe(node.value)) {
      sourceFile.addWarning("encoded-literal", node.value, node.loc);
    }
  }
  // Else we are checking all other string with our suspect method
  else {
    for (const regex of kShadyLinkRegExps) {
      if (regex.test(node.value)) {
        sourceFile.addWarning("shady-link", node.value, node.loc);

        return;
      }
    }

    sourceFile.analyzeLiteral(node);
  }
}

export default {
  name: "isLiteral",
  validateNode,
  main,
  breakOnMatch: false
};
