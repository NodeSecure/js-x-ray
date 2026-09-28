// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import {
  isStringLiteral
} from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";
import {
  hasImportedModules,
  matchTracedCall,
  traceAllFromModule,
  type ModuleScopedIdentifier
} from "../tracing.ts";

// CONSTANTS
const kWeakAlgorithms = new Set([
  "md5",
  "sha1",
  "ripemd160",
  "md4",
  "md2"
]);

const kTracedFunctions = new Set<ModuleScopedIdentifier>([
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
  traceAllFromModule(ctx.sourceFile.tracer, kTracedFunctions);
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;
  const arg = node.arguments.at(0);

  if (isStringLiteral(arg) && kWeakAlgorithms.has(arg.value)) {
    const warning = generateWarning(
      "crypto.weak-algorithm",
      { value: arg.value, location: node.loc }
    );
    sourceFile.warnings.push(warning);
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
