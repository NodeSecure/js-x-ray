// Internal Dependencies
import { warnings } from "../constants.js";

function validateNode(node) {
  const isCallExpression = node.type === "CallExpression";
  return [
    isCallExpression &&
        ((node.callee.type === "Identifier" &&
        node.callee.name === "createHash")
        ||
        (node.callee.type === "MemberExpression" &&
        node.callee.property.name === "createHash"))
  ];
}

function main(node, { analysis }) {
  const arg = node.arguments.at(0);
  if (arg.value === "md5" && analysis.dependencies.has("crypto")) {
    analysis.addWarning(warnings.weakCrypto, "md5", node.loc);
  }
}

export default {
  name: "isWeakCrypto",
  validateNode, main, breakOnMatch: false
};
