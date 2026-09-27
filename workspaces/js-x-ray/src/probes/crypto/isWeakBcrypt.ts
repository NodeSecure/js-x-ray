// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../../ProbeRunner.ts";
import { isStringLiteral } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";
import {
  hasImportedModules,
  matchTracedCall,
  traceAll
} from "../tracing.ts";
import { resolveNumericValue } from "./resolveNumericValue.ts";

const kMinRounds = 10;

const kModuleName = "bcryptjs";

// Maps a traced bcrypt function to the index of its work factor argument
const kWorkFactorArgIndex = new Map([
  [`${kModuleName}.hash`, 1],
  [`${kModuleName}.hashSync`, 1],
  [`${kModuleName}.genSalt`, 0],
  [`${kModuleName}.genSaltSync`, 0]
]);

const kTracedFunctions = new Set(kWorkFactorArgIndex.keys());

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (!hasImportedModules(ctx, kModuleName)) {
    return [false];
  }

  return matchTracedCall(ctx, kTracedFunctions);
}

function initialize(ctx: ProbeContext) {
  traceAll(ctx.sourceFile.tracer, kTracedFunctions, { moduleName: kModuleName });
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile } = ctx;
  const { tracer } = sourceFile;
  const argIndex = kWorkFactorArgIndex.get(ctx.data as string)!;
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

export default {
  name: "isWeakBcrypt",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
