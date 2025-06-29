// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";

// CONSTANTS
const kWeakAlgorithms = new Set([
  "md5",
  "sha1",
  "ripemd160",
  "md4",
  "md2"
]);

function validateNode(
  node: ESTree.Node,
  sourceFile: SourceFile
): [boolean, any?] {
  const { tracer } = sourceFile;

  const id = getCallExpressionIdentifier(node);
  if (id === null || !tracer.importedModules.has("crypto")) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [
    data !== null && data.identifierOrMemberExpr === "crypto.createHash"
  ];
}

function initialize(
  sourceFile: SourceFile
) {
  sourceFile.tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
}

function main(
  node: any,
  { sourceFile }
) {
  const arg = node.arguments.at(0);

  if (arg && kWeakAlgorithms.has(arg.value)) {
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
