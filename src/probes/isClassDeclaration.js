// Import Internal Dependencies
import { extractNode } from "../utils/index.js";

// CONSTANTS
const kIdExtractor = extractNode("Identifier");

function validateNode(node) {
  return [
    node.type === "ClassDeclaration"
  ];
}

function main(node, options) {
  const { analysis } = options;

  kIdExtractor(
    ({ name }) => analysis.identifiersName.push({ name, type: "class" }),
    [node.id, node.superClass]
  );
}

export default {
  name: "isClassDeclaration",
  validateNode,
  main,
  breakOnMatch: false
};
