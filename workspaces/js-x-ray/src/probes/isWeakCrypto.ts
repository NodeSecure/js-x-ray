// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.js";
import { generateWarning } from "../warnings.js";
import {
  isLiteral
} from "../types/estree.js";

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
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

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
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  tracer.trace("crypto.createHash", {
    followConsecutiveAssignment: true,
    moduleName: "crypto"
  });
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;
  const arg = node.arguments.at(0);

  if (isLiteral(arg) && kWeakAlgorithms.has(arg.value)) {
    const warning = generateWarning(
      "weak-crypto",
      { value: arg.value, location: node.loc }
    );
    sourceFile.warnings.push(warning);
  }
}

export default {
  name: "isWeakCrypto",
  validateNode,
  main,
  initialize,
  breakOnMatch: false
};
