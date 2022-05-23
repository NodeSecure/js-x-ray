// Internal Dependencies
import { warnings } from "../constants.js";

function validateNode(node) {
  return [
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "createHash"
  ];
}

function main(node, { analysis }) {
  const arg = node.arguments.at(0);
  if (arg.value === "md5") {
    analysis.addWarning(warnings.weakCrypto, "md5", node.loc);
  }
}

export default {
  name: "isWeakCrypto",
  validateNode, main, breakOnMatch: false
};
