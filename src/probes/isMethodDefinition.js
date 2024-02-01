// Import Internal Dependencies
import { extractNode } from "../utils/index.js";

// CONSTANTS
const kIdExtractor = extractNode("Identifier");

function validateNode(node) {
  return [
    node.type === "MethodDefinition"
  ];
}

function main(node, options) {
  const { sourceFile } = options;

  kIdExtractor(
    ({ name }) => sourceFile.identifiersName.push({ name, type: "method" }),
    [node.key]
  );
}

export default {
  name: "isMethodDefinition",
  validateNode,
  main,
  breakOnMatch: false
};
