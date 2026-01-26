// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import {
  isLiteral
} from "../types/estree.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
const kWeakAlgorithms = new Set([
  "md5",
  "sha1",
  "ripemd160",
  "md4",
  "md2"
]);

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("crypto")) {
    return [false];
  }

  return [
    ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr === "crypto.createHash"
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
  breakOnMatch: false,
  context: {}
};
