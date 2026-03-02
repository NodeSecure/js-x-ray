// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import {
  isLiteral
} from "../estree/types.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
const kWeakAlgorithms = new Set([
  "md5",
  "sha1",
  "ripemd160",
  "md4",
  "md2"
]);

const kTracedFunctions = new Set([
  "crypto.createHash",
  "crypto.createHmac"
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
    kTracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  for (const identifierOrMemberExpr of kTracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }
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
