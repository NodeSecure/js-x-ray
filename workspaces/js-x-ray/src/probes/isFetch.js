// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

function validateNode(node) {
  const id = getCallExpressionIdentifier(node);

  return [id === "fetch"];
}

function main(_node, { sourceFile }) {
  sourceFile.flags.add("fetch");
}

export default {
  name: "isFetch",
  validateNode,
  main,
  breakOnMatch: false
};
