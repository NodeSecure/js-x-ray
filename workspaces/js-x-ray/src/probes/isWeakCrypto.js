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

function initialize(sourceFile) {
  sourceFile?.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
}

function main(node, { sourceFile }) {
  const arg = node.arguments.at(0);

  if (kWeakAlgorithms.has(arg.value)) {
    sourceFile.addWarning("weak-crypto", arg.value, node.loc);
  }
}

export default {
  name: "isWeakCrypto",
  validateNode,
  main,
  initialize,
  breakOnMatch: false
};
