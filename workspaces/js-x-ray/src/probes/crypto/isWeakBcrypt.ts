// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../../ProbeRunner.ts";
import { defineProbe } from "../../defineProbe.ts";
import { isStringLiteral } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";
import {
  hasImportedModules,
  matchTracedCall,
  traceAllFromModule,
  type ModuleScopedIdentifier
} from "../tracing.ts";
import { resolveNumericValue } from "./resolveNumericValue.ts";

const kMinRounds = 10;

const kModuleName = "bcryptjs";

// Maps a traced bcrypt function to the index of its work factor argument
const kWorkFactorArgIndex = new Map<ModuleScopedIdentifier, number>([
  ["bcryptjs.hash", 1],
  ["bcryptjs.hashSync", 1],
  ["bcryptjs.genSalt", 0],
  ["bcryptjs.genSaltSync", 0]
]);

const kTracedFunctions = new Set(kWorkFactorArgIndex.keys());

function validateNode(
  _node: ESTree.CallExpression,
  ctx: ProbeContext
): [boolean, any?] {
  if (!hasImportedModules(ctx, kModuleName)) {
    return [false];
  }

  return matchTracedCall(ctx, kTracedFunctions);
}

function initialize(ctx: ProbeContext) {
  traceAllFromModule(ctx.sourceFile.tracer, kTracedFunctions);
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile } = ctx;
  const { tracer } = sourceFile;
  const argIndex = kWorkFactorArgIndex.get(ctx.data as ModuleScopedIdentifier)!;
  const arg = node.arguments.at(argIndex);

  const numValue = resolveNumericValue(arg, tracer.literalIdentifiers);

  if (numValue !== null) {
    if (numValue < kMinRounds) {
      sourceFile.warnings.push(
        generateWarning("crypto.weak-bcrypt", {
          value: "low-work-factor",
          location: node.loc
        })
      );
    }
  }
  else if (isStringLiteral(arg)) {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-bcrypt", {
        value: "hardcoded-salt",
        location: node.loc
      })
    );
  }
}

export default defineProbe({
  name: "isWeakBcrypt",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
});
