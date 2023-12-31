// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// CONSTANTS
const kWeakAlgorithms = new Set([
  "md5",
  "sha1",
  "ripemd160",
  "md4",
  "md2"
]);

function validateNode(node, { tracer }) {
  const id = getCallExpressionIdentifier(node);
  if (id === null || !tracer.importedModules.has("crypto")) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null && data.identifierOrMemberExpr === "crypto.createHash"];
}

function main(node, { analysis }) {
  const arg = node.arguments.at(0);

  if (kWeakAlgorithms.has(arg.value)) {
    analysis.addWarning("weak-crypto", arg.value, node.loc);
  }
}

export default {
  name: "isWeakCrypto",
  validateNode,
  main,
  breakOnMatch: false
};
