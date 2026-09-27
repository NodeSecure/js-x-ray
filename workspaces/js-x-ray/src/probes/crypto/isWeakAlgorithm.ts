// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import {
  isStringLiteral
} from "../../estree/types.ts";
import {
  hasImportedModules,
  matchTracedCall,
  traceAll
} from "../tracing.ts";

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
  if (!hasImportedModules(ctx, "crypto")) {
    return [false];
  }

  return matchTracedCall(ctx, kTracedFunctions);
}

function initialize(
  ctx: ProbeContext
) {
  traceAll(ctx.sourceFile.tracer, kTracedFunctions, { moduleName: "crypto" });
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;
  const arg = node.arguments.at(0);

  if (isStringLiteral(arg) && kWeakAlgorithms.has(arg.value)) {
    sourceFile.addWarning("crypto.weak-algorithm",
      { value: arg.value, location: node.loc }
    );
  }
}

export default {
  name: "isWeakCrypto",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
