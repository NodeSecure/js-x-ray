// Import Internal Dependencies
import { extractNode } from "../utils.js";

// CONSTANTS
const kIdExtractor = extractNode("Identifier");

function validateNode(node) {
  return [
    node.type === "MethodDefinition"
  ];
}

function main(node, options) {
  const { analysis } = options;

  kIdExtractor(
    ({ name }) => analysis.identifiersName.push({ name, type: "method" }),
    [node.key]
  );
}

export default {
  name: "isMethodDefinition",
  validateNode,
  main,
  breakOnMatch: false
};
